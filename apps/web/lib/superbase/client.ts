<<<<<<< HEAD
import { createBrowserClient } from "@supabase/ssr";
=======
import { createBrowserClient } from '@supabase/ssr'
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
<<<<<<< HEAD
  );
}
=======
  )
}
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)
