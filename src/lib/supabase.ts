import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import { getClientConfig } from '../config';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { supabaseUrl, supabaseAnonKey } = getClientConfig();
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseClient;
}

export function removeRealtimeChannel(channel: RealtimeChannel | null) {
  if (!channel) {
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  void client.removeChannel(channel);
}
