'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/superbase/client'
import { useParams, useRouter } from 'next/navigation'
import {
    ShieldAlert,
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    ExternalLink,
    CreditCard,
    MessageSquare,
    Search
} from 'lucide-react'
import Link from 'next/link'

export default function DisputeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [dispute, setDispute] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (params?.id) fetchDispute()
    }, [params?.id])

    async function fetchDispute() {
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
                .eq('id', params.id)
                .single()

            if (error) throw error
            setDispute(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="text-amber-500" size={24} />
            case 'under_review': return <Search className="text-blue-500" size={24} />
            case 'resolved': return <CheckCircle2 className="text-emerald-500" size={24} />
            case 'refunded': return <CheckCircle2 className="text-emerald-500" size={24} />
            case 'rejected': return <AlertCircle className="text-rose-500" size={24} />
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    )

    if (error || !dispute) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
            <ShieldAlert size={64} className="text-rose-500 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Dispute Not Found</h1>
            <p className="text-slate-400 mb-8">{error || 'The dispute you are looking for does not exist.'}</p>
            <Link href="/disputes" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
                Back to Dashboard
            </Link>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/disputes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Disputes
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                                {getStatusIcon(dispute.status)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    Dispute Review
                                </h1>
                                <p className="text-slate-500 font-mono text-sm">Case ID: {dispute.id}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${dispute.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    dispute.status === 'under_review' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                        dispute.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            dispute.status === 'refunded' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                {dispute.status.replace('_', ' ')}
                            </span>
                            <span className="text-slate-500 text-sm">Raised {new Date(dispute.created_at).toLocaleString()}</span>
                        </div>
                    </div>

                    <Link
                        href="/messages?support=true"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-2xl transition-all font-semibold"
                    >
                        <MessageSquare size={18} />
                        Contact Support
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 underline decoration-primary decoration-2 underline-offset-8">
                                <FileText className="text-primary" size={20} />
                                Dispute Reason
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-lg italic bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                                &quot;{dispute.reason}&quot;
                            </p>

                            {dispute.evidence_url && (
                                <div className="mt-8">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Provided Evidence</h3>
                                    <a
                                        href={dispute.evidence_url}
                                        target="_blank"
                                        className="inline-flex items-center gap-3 px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-primary transition-all group"
                                    >
                                        <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
                                        Review Evidence Link
                                    </a>
                                </div>
                            )}
                        </section>

                        {dispute.admin_notes && (
                            <section className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
                                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-3">
                                    <ShieldAlert size={20} />
                                    Resolution Update
                                </h2>
                                <div className="text-slate-300 leading-relaxed bg-primary/10 p-6 rounded-2xl border border-primary/10">
                                    {dispute.admin_notes}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="space-y-6">
                        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">
                                Payment Details
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Listing</p>
                                    <p className="text-white font-bold">{dispute.payment_records.listings.title}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Amount Disputed</p>
                                    <p className="text-2xl font-black text-primary font-mono">{dispute.payment_records.amount_paid} XLM</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-600 uppercase font-bold mb-1">Stellar TX Hash</p>
                                    <p className="text-[10px] font-mono text-slate-400 break-all bg-slate-950 p-2 rounded border border-slate-800">
                                        {dispute.payment_records.transaction_hash}
                                    </p>
                                    <Link
                                        href={`https://stellar.expert/explorer/public/tx/${dispute.payment_records.transaction_hash}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-2"
                                    >
                                        View on Explorer <ExternalLink size={10} />
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <div className="p-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                                <CreditCard size={20} />
                            </div>
                            <h4 className="text-sm font-bold text-white mb-1">Refund Method</h4>
                            <p className="text-xs text-slate-500">Refunds are issued to the original Stellar wallet used for payment.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
