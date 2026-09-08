import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase is now the cloud database for Maddah.
// The publishable key is safe to expose in browser code; RLS protects the tables.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gtmvhesgvlotaunkfvni.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_BCKsvj1aCqSCX_Qg4k3_CQ_UNeELTRk';

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Backwards-compatible Firestore-like types/functions.
// storage.ts can keep its existing interface while the backend is Supabase.
export type DocRef = {
  collectionName: string;
  docId: string;
};

export type Snapshot = {
  exists: () => boolean;
  data: () => any;
  metadata: {
    hasPendingWrites: boolean;
    fromCache?: boolean;
  };
};

export const db = supabase;

export const doc = (_database: SupabaseClient, collectionName: string, docId: string): DocRef => ({
  collectionName,
  docId,
});

export const getDoc = async (ref: DocRef): Promise<Snapshot> => {
  try {
    const { data, error } = await supabase
      .from(ref.collectionName)
      .select('data, updated_at')
      .eq('key', ref.docId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        exists: () => false,
        data: () => undefined,
        metadata: { hasPendingWrites: false, fromCache: false },
      };
    }

    return {
      exists: () => true,
      data: () => ({
        data: data.data,
        updatedAt: data.updated_at,
      }),
      metadata: { hasPendingWrites: false, fromCache: false },
    };
  } catch (error) {
    console.warn('[Supabase] Read error, falling back to local storage cache:', error);
    return {
      exists: () => false,
      data: () => undefined,
      metadata: { hasPendingWrites: false, fromCache: true },
    };
  }
};

export const setDoc = async (
  ref: DocRef,
  value: { data: any; updatedAt?: string }
) => {
  try {
    const { error } = await supabase
      .from(ref.collectionName)
      .upsert(
        {
          key: ref.docId,
          data: value.data,
          updated_at: value.updatedAt || new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) throw error;
  } catch (error) {
    console.warn('[Supabase] Write error:', error);
  }
};

export const onSnapshot = (
  ref: DocRef,
  next: (snapshot: Snapshot) => void,
  error?: (err: unknown) => void
): (() => void) => {
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let active = true;

  const emitCurrent = async () => {
    const snapshot = await getDoc(ref);
    if (active) next(snapshot);
  };

  try {
    channel = supabase
      .channel(`maddah:${ref.collectionName}:${ref.docId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: ref.collectionName,
          filter: `key=eq.${ref.docId}`,
        },
        (payload) => {
          if (!active) return;
          if (payload.eventType === 'DELETE') {
            next({
              exists: () => false,
              data: () => undefined,
              metadata: { hasPendingWrites: false, fromCache: false },
            });
            return;
          }

          const row: any = payload.new;
          next({
            exists: () => true,
            data: () => ({
              data: row.data,
              updatedAt: row.updated_at,
            }),
            metadata: { hasPendingWrites: false, fromCache: false },
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          emitCurrent().catch((err) => error?.(err));
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          error?.(new Error(`Supabase realtime status: ${status}`));
        }
      });
  } catch (err) {
    console.warn('[Supabase] Realtime initialization error:', err);
    error?.(err);
  }

  return () => {
    active = false;
    if (channel) {
      supabase.removeChannel(channel).catch(() => {});
    }
  };
};
