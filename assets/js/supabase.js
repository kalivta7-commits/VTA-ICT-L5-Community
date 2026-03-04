// Supabase Configuration

const SUPABASE_URL = "https://rogppaejmhzzsysbvmzn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xBwtytcw3lAvgDHNe38Qng_qcxJy6Al";

// Create Supabase client
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
