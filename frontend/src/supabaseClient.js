import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
<<<<<<< HEAD
  import.meta.env.VITE_SUPABASE_KEY
=======
  import.meta.env.VITE_SUPABASE_ANON_KEY
>>>>>>> 81a55d56250156c602d7e5864623291927bb6eec
);

export { supabase };
