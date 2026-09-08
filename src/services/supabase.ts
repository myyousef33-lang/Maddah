import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gtmvhesgvlotaunkfvni.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_BCKsvj1aCqSCX_Qg4k3_CQ_UNeELTRk';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 10 } }
});

type DocRef = { collectionName: string; docId: string };
type Snapshot = { exists: () => boolean; data: () => any; id: string };

export const db = {} as any;
export const doc = (_db: any, collectionName: string, docId: string): DocRef => ({ collectionName, docId });

export async function getDoc(ref: DocRef): Promise<Snapshot> {
  try {
    const { data, error } = await supabase.from(ref.collectionName).select('data, updated_at').eq('key', ref.docId).maybeSingle();
    if (error) throw error;
    return { exists: () => !!data, data: () => data?.data, id: ref.docId };
  } catch (error) {
    console.error('[Supabase] Read error:', error);
    return { exists: () => false, data: () => undefined, id: ref.docId };
  }
}

export async function setDoc(ref: DocRef, value: any): Promise<void> {
  try {
    const { error } = await supabase.from(ref.collectionName).upsert({
      key: ref.docId,
      data: value,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    if (error) throw error;
  } catch (error) {
    console.error('[Supabase] Write error:', error);
  }
}

export function onSnapshot(ref: DocRef, callback: (snapshot: Snapshot) => void): () => void {
  let active = true;
  const channel = supabase.channel(`app_data:${ref.docId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: ref.collectionName, filter: `key=eq.${ref.docId}` }, async () => {
      if (!active) return;
      callback(await getDoc(ref));
    })
    .subscribe(async () => {
      if (!active) return;
      callback(await getDoc(ref));
    });
  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}
