import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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

    let query = supabase
        .from('disputes')
        .select(`
      *,
      payment_records (
        transaction_hash,
        amount_paid,
        listing_id,
        listings (title)
      ),
      users (username, email)
    `)
        .eq('id', params.id)

    if (!isAdmin) {
        query = query.eq('user_id', user.id)
    }

    const { data, error } = await query.single()

    if (error || !data) {
        return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    return NextResponse.json(data)
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin can update dispute status/notes
    const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!userData?.is_admin) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    try {
        const { status, admin_notes } = await request.json()

        if (!status && admin_notes === undefined) {
            return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
        }

        const updateData: any = {}
        if (status) updateData.status = status
        if (admin_notes !== undefined) updateData.admin_notes = admin_notes

        const { data: dispute, error } = await supabase
            .from('disputes')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // If status is 'refunded', also update the payment record status
        if (status === 'refunded') {
            const adminClient = createAdminClient()
            const { error: paymentError } = await adminClient
                .from('payment_records')
                .update({ status: 'refunded' })
                .eq('id', dispute.payment_id)

            if (paymentError) {
                console.error('Failed to update payment status to refunded:', paymentError)
            }
        }

        return NextResponse.json(dispute)
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
