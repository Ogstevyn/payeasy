'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/superbase/client'
import { useParams, useRouter } from 'next/navigation'
import {
    ShieldCheck,
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    ExternalLink,
    CreditCard,
    User,
    Search,
    Check,
    X,
    MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDisputeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [dispute, setDispute] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [adminNotes, setAdminNotes] = useState('')
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
          users (username, email),
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
            setAdminNotes(data.admin_notes || '')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (status: string) => {
        setUpdating(true)
        try {
            const response = await fetch(`/api/disputes/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    admin_notes: adminNotes
                })
            })

            if (!response.ok) throw new Error('Update failed')

            await fetchDispute()
            alert(`Dispute updated to ${status}`)
        } catch (err: any) {
            alert(err.message)
        } finally {
            setUpdating(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    )

    if (error || !dispute) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
            <ShieldCheck size={64} className="text-rose-500 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Dispute Not Found</h1>
            <p className="text-slate-400 mb-8">{error || 'The dispute you are looking for does not exist.'}</p>
            <Link href="/admin/disputes" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
                Back to Admin Panel
            </Link>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <Link href="/admin/disputes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Dispute Queue
                </Link>

                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-8">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
                                    <ShieldCheck className="text-primary" size={32} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-white uppercase tracking-tight">Review Case</h1>
                                    <p className="text-slate-500 font-mono text-xs">{dispute.id}</p>
                                </div>
                            </div>

                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${dispute.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    dispute.status === 'under_review' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                        dispute.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            dispute.status === 'refunded' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                {dispute.status.replace('_', ' ')}
                            </div>
                        </header>

                        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <FileText size={16} /> User Allegation
                            </h2>
                            <div className="bg-slate-950/80 p-8 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <p className="text-xl text-slate-200 leading-relaxed italic">&quot;{dispute.reason}&quot;</p>
                            </div>

                            {dispute.evidence_url && (
                                <div className="mt-8 pt-8 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-400">Supporting Evidence provided:</span>
                                    <a href={dispute.evidence_url} target="_blank" className="flex items-center gap-2 text-primary hover:text-white transition-colors font-bold text-sm">
                                        Open Evidence <ExternalLink size={16} />
                                    </a>
                                </div>
                            )}
                        </section>

                        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-xl">
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Admin Resolution Notes</h2>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Document your investigation findings and resolution rationale here..."
                                className="w-full h-40 bg-slate-950 border border-slate-800 focus:border-primary rounded-2xl p-6 text-white text-sm transition-all outline-none resize-none"
                            />
                        </section>
                    </div>

                    <aside className="w-full lg:w-96 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-8 border-b border-slate-800 pb-4">Account Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">@{dispute.users.username}</p>
                                        <p className="text-xs text-slate-500">{dispute.users.email}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-800">
                                    <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Original Payment</p>
                                    <p className="text-white font-bold text-sm mb-1">{dispute.payment_records.listings.title}</p>
                                    <p className="text-3xl font-black text-primary font-mono">{dispute.payment_records.amount_paid} <span className="text-xs">XLM</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-4">
                            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Adjudication Actions</h3>

                            <button
                                onClick={() => handleUpdate('under_review')}
                                disabled={updating}
                                className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                            >
                                <Search size={16} /> Mark Under Review
                            </button>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleUpdate('resolved')}
                                    disabled={updating}
                                    className="py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-2"
                                >
                                    <Check size={16} /> Resolve
                                </button>
                                <button
                                    onClick={() => handleUpdate('rejected')}
                                    disabled={updating}
                                    className="py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex flex-col items-center gap-2"
                                >
                                    <X size={16} /> Reject
                                </button>
                            </div>

                            <button
                                onClick={() => handleUpdate('refunded')}
                                disabled={updating}
                                className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 mt-4"
                            >
                                <CreditCard size={18} /> Approve & Refund
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
