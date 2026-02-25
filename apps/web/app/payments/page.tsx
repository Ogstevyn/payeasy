'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    ShieldAlert,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

type Payment = {
    id: string
    amount_paid: number
    status: 'pending' | 'confirmed' | 'failed' | 'refunded'
    transaction_hash: string
    created_at: string
    listings: {
        title: string
        address: string
    }
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchPayments()
    }, [])

    async function fetchPayments() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('payment_records')
                .select(`
          *,
          listings (title, address)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!error) setPayments(data || [])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4">
                        <CreditCard className="text-primary" size={32} />
                        My Payments
                    </h1>
                    <p className="text-slate-400">View your transaction history and manage payment issues.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
                        <p className="text-slate-500 mb-6">You haven&apos;t made any payments yet.</p>
                        <Link href="/browse" className="px-8 py-3 bg-primary text-white rounded-xl font-bold">
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payments.map((payment) => (
                            <div key={payment.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${payment.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                payment.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-slate-500/10 text-slate-500'
                                            }`}>
                                            {payment.status}
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{payment.listings.title}</h3>
                                    <p className="text-slate-500 text-sm truncate max-w-sm">{payment.listings.address}</p>
                                </div>

                                <div className="flex items-center gap-8 justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-primary">{payment.amount_paid} XLM</div>
                                        <div className="text-[10px] text-slate-600 font-mono uppercase">TX: {payment.transaction_hash.slice(0, 8)}</div>
                                    </div>

                                    {payment.status === 'confirmed' && (
                                        <Link
                                            href={`/disputes/new?payment=${payment.id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg transition-all text-sm font-semibold"
                                        >
                                            <ShieldAlert size={16} />
                                            Dispute
                                        </Link>
                                    )}

                                    {payment.status === 'refunded' && (
                                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-semibold italic">
                                            <CheckCircle2 size={16} />
                                            Refunded
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
