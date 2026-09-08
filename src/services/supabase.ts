import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://gtmvhesgvlotaunkfvni.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_BCKsvj1aCqSCX_Qg4k3_CQ_UNeELTRk';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export interface DocRef {
  collectionName: string;
  docId: string;
}

export interface Snapshot {
  exists: () => boolean;
  data: () => any;
  id: string;
  metadata?: { hasPendingWrites?: boolean; fromCache?: boolean };
}

export const db = {
  name: 'supabase_maddah_db'
};

export const doc = (_db: any, collectionName: string, docId: string): DocRef => ({
  collectionName,
  docId
});

/**
 * Reads a document from Supabase app_data table
 */
export async function getDoc(ref: DocRef): Promise<Snapshot> {
  try {
    const { data, error } = await supabase
      .from(ref.collectionName)
      .select('data, updated_at')
      .eq('key', ref.docId)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Read error for key ${ref.docId}:`, error.message);
      return { exists: () => false, data: () => undefined, id: ref.docId };
    }

    return {
      exists: () => !!data && data.data !== undefined && data.data !== null,
      data: () => data?.data,
      id: ref.docId,
      metadata: { hasPendingWrites: false, fromCache: false }
    };
  } catch (error) {
    console.warn(`[Supabase] Query exception for key ${ref.docId}:`, error);
    return { exists: () => false, data: () => undefined, id: ref.docId };
  }
}

/**
 * Writes or merges data into Supabase app_data table
 */
export async function setDoc(ref: DocRef, value: any): Promise<void> {
  try {
    const updatedAt = value?.updatedAt || new Date().toISOString();
    const { error } = await supabase
      .from(ref.collectionName)
      .upsert({
        key: ref.docId,
        data: value,
        updated_at: updatedAt
      }, { onConflict: 'key' });

    if (error) {
      console.warn(`[Supabase] Write error for key ${ref.docId}:`, error.message);
    }
  } catch (error) {
    console.warn(`[Supabase] Upsert exception for key ${ref.docId}:`, error);
  }
}

/**
 * Real-time listener for Supabase app_data rows with automatic unsubscribe
 */
export function onSnapshot(
  ref: DocRef,
  callback: (snapshot: Snapshot) => void,
  onError?: (err: unknown) => void
): () => void {
  let active = true;

  // Initial read on subscribe
  getDoc(ref).then((snap) => {
    if (active && snap.exists()) {
      callback(snap);
    }
  }).catch((err) => {
    if (onError) onError(err);
  });

  const channelId = `realtime_${ref.collectionName}_${ref.docId.replace(/[^a-zA-Z0-9_]/g, '_')}_${Math.random().toString(36).substring(2, 7)}`;
  
  const channel = supabase.channel(channelId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ref.collectionName,
        filter: `key=eq.${ref.docId}`
      },
      (payload) => {
        if (!active) return;
        if (payload.eventType === 'DELETE') {
          callback({
            exists: () => false,
            data: () => undefined,
            id: ref.docId
          });
        } else {
          const row = payload.new as { data?: any; updated_at?: string } | undefined;
          if (row && row.data !== undefined) {
            callback({
              exists: () => true,
              data: () => row.data,
              id: ref.docId
            });
          } else {
            // Re-fetch to ensure fresh data
            getDoc(ref).then(s => {
              if (active) callback(s);
            }).catch(() => {});
          }
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        if (onError) onError(new Error(`Realtime channel error for ${ref.docId}`));
      }
    });

  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}
