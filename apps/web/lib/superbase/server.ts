<<<<<<< HEAD
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
=======
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
<<<<<<< HEAD
          return cookieStore.getAll();
=======
          return cookieStore.getAll()
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
<<<<<<< HEAD
            );
=======
            )
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)
          } catch {}
        },
      },
    }
<<<<<<< HEAD
  );
}
=======
  )
}
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)
