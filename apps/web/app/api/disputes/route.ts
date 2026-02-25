import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { payment_id, reason, evidence_url } = await request.json()

        if (!payment_id || !reason) {
            return NextResponse.json({ error: 'Payment ID and reason are required' }, { status: 400 })
        }

        // Verify payment belongs to user
        const { data: payment, error: paymentError } = await supabase
            .from('payment_records')
            .select('id, user_id')
            .eq('id', payment_id)
            .eq('user_id', user.id)
            .single()

        if (paymentError || !payment) {
            return NextResponse.json({ error: 'Payment record not found or unauthorized' }, { status: 404 })
        }

        // Check for existing dispute
        const { data: existingDispute } = await supabase
            .from('disputes')
            .select('id')
            .eq('payment_id', payment_id)
            .maybeSingle()

        if (existingDispute) {
            return NextResponse.json({ error: 'A dispute already exists for this payment' }, { status: 409 })
        }

        // Create dispute
        const { data, error } = await supabase
            .from('disputes')
            .insert({
                payment_id,
                user_id: user.id,
                reason,
                evidence_url,
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    const isAdmin = userData?.is_admin || false

    let query = supabase.from('disputes').select(`
    *,
    payment_records (
      transaction_hash,
      amount_paid,
      listing_id,
      listings (title)
    ),
    users (username)
  `)

    if (!isAdmin) {
        // Regular users only see their own disputes
        query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
}
