'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/superbase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    ShieldAlert,
    ArrowLeft,
    Send,
    Info,
    AlertCircle,
    FileText,
    Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'

export default function NewDisputePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const paymentId = searchParams?.get('payment')

    const [payment, setPayment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [reason, setReason] = useState('')
    const [evidenceUrl, setEvidenceUrl] = useState('')

    const supabase = createClient()

    useEffect(() => {
        if (!paymentId) {
            router.push('/payments')
            return
        }
        fetchPaymentDetail()
    }, [paymentId])

    async function fetchPaymentDetail() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('payment_records')
                .select('*, listings(title)')
                .eq('id', paymentId)
                .single()

            if (error) throw error
            setPayment(data)
        } catch (err: any) {
            setError('Payment not found')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason) return

        setSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/disputes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_id: paymentId,
                    reason,
                    evidence_url: evidenceUrl
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit dispute')
            }

            router.push('/disputes')
        } catch (err: any) {
            setError(err.message)
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/payments" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} />
                    Back to Payments
                </Link>

                <header className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-6 border border-primary/20">
                        <ShieldAlert className="text-primary" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">Raise a Dispute</h1>
                    <p className="text-slate-400">Please provide details about the issue with your payment.</p>
                </header>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-8 flex items-start gap-3 text-rose-500">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {payment && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-primary">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Disputing Payment For</p>
                                <h3 className="text-lg font-bold text-white">{payment.listings.title}</h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-primary">{payment.amount_paid} XLM</div>
                            <div className="text-[10px] text-slate-600 font-mono">ID: {payment.id.slice(0, 8)}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/40 border border-slate-800 p-8 rounded-3xl shadow-xl">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                            <FileText size={16} className="text-primary" />
                            Reason for Dispute
                        </label>
                        <textarea
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Landlord did not provide access key, property not as described..."
                            className="w-full h-32 bg-slate-950 border border-slate-800 focus:border-primary rounded-xl p-4 text-white transition-all outline-none resize-none placeholder:text-slate-700"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                            <LinkIcon size={16} className="text-primary" />
                            Evidence URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="Link to photos, contract, or chat logs"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-primary rounded-xl p-4 text-white transition-all outline-none placeholder:text-slate-700"
                        />
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-4 mb-8">
                        <Info className="text-primary shrink-0 mt-1" size={18} />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Disputes are reviewed by our admin team within 24-48 hours. If approved, the refund will be processed back to your Stellar wallet minus 0.001 XLM transaction fee.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !reason}
                        className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-3"
                    >
                        {submitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Dispute
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
