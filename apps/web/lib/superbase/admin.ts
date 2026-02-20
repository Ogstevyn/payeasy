<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js";
=======
import { createClient } from '@supabase/supabase-js'
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
<<<<<<< HEAD
  );
}
=======
  )
}
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)
