'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/superbase/client'
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink,
    MessageSquare,
    ShieldAlert,
    Search,
    Plus
} from 'lucide-react'
import Link from 'next/link'

type Dispute = {
    id: string
    payment_id: string
    reason: string
    status: 'pending' | 'under_review' | 'resolved' | 'rejected' | 'refunded'
    created_at: string
    payment_records: {
        transaction_hash: string
        amount_paid: number
        listings: {
            title: string
        }
    }
}

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchDisputes()
    }, [])

    async function fetchDisputes() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('disputes')
                .select(`
          *,
          payment_records (
            transaction_hash,
            amount_paid,
            listings (title)
          )
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setDisputes(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: Dispute['status']) => {
        switch (status) {
            case 'pending': return <Clock className="text-amber-500" size={18} />
            case 'under_review': return <Search className="text-blue-500" size={18} />
            case 'resolved': return <CheckCircle2 className="text-emerald-500" size={18} />
            case 'refunded': return <CheckCircle2 className="text-emerald-500" size={18} />
            case 'rejected': return <AlertCircle className="text-rose-500" size={18} />
        }
    }

    const getStatusStyles = (status: Dispute['status']) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'under_review': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'refunded': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200'
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <ShieldAlert className="text-primary" size={32} />
                            Disputes & Refunds
                        </h1>
                        <p className="text-slate-400">Manage your payment issues and track refund status.</p>
                    </div>
                    <Link
                        href="/payments"
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-semibold shadow-lg shadow-primary/20 w-fit"
                    >
                        <Plus size={20} />
                        Raise New Dispute
                    </Link>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium">Loading your disputes...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
                        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">Error loading disputes</h3>
                        <p className="text-slate-400 mb-6">{error}</p>
                        <button
                            onClick={fetchDisputes}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
                        <ShieldAlert className="mx-auto text-slate-700 mb-6" size={64} />
                        <h3 className="text-2xl font-bold text-white mb-3">No active disputes</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Everything looks good! You haven&apos;t raised any disputes for your payments yet.
                        </p>
                        <Link
                            href="/payments"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
                        >
                            View My Payments
                            <ExternalLink size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {disputes.map((dispute) => (
                            <div
                                key={dispute.id}
                                className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all group"
                            >
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(dispute.status)}`}>
                                                {getStatusIcon(dispute.status)}
                                                {dispute.status.replace('_', ' ').toUpperCase()}
                                            </div>
                                            <span className="text-slate-500 text-xs">
                                                Ref: {dispute.id.slice(0, 8)}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                            {dispute.payment_records.listings.title}
                                        </h3>

                                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 italic">
                                            &quot;{dispute.reason}&quot;
                                        </p>

                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} />
                                                Raised on {new Date(dispute.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-primary">{dispute.payment_records.amount_paid} XLM</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3">
                                        <Link
                                            href={`/disputes/${dispute.id}`}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            View Details
                                        </Link>
                                        <Link
                                            href={`/messages?listing=${dispute.payment_id}`}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium border border-primary/20"
                                        >
                                            <MessageSquare size={16} />
                                            Admin Chat
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        Transaction:
                                        <span className="font-mono text-slate-400">{dispute.payment_records.transaction_hash.slice(0, 12)}...</span>
                                    </span>
                                    <Link href={`https://stellar.expert/explorer/public/tx/${dispute.payment_records.transaction_hash}`} target="_blank" className="hover:text-primary flex items-center gap-1">
                                        Explorer <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
