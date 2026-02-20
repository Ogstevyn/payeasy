<<<<<<< HEAD
import { createClient } from "@/lib/superbase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, address, rent_xlm, bedrooms, bathrooms, amenities } = body;

  const { data, error } = await supabase
    .from("listings")
=======
import { createClient } from '@/lib/superbase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, address, rent_xlm, bedrooms, bathrooms, amenities } = body

  const { data, error } = await supabase
    .from('listings')
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)
    .insert({
      landlord_id: user.id,
      title,
      description,
      address,
      rent_xlm,
      bedrooms,
      bathrooms,
      amenities: amenities ?? [],
    })
    .select()
<<<<<<< HEAD
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
=======
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
>>>>>>> 8a50368 (resolve: accept deletion of root package-lock)
