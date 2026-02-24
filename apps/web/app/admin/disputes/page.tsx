'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/superbase/client'
import {
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    MoreVertical,
    Filter,
    ArrowUpDown,
    User,
    CreditCard,
    Calendar,
    Search
} from 'lucide-react'
import Link from 'next/link'

type Dispute = {
    id: string
    payment_id: string
    user_id: string
    reason: string
    status: 'pending' | 'under_review' | 'resolved' | 'rejected' | 'refunded'
    created_at: string
    users: {
        username: string
    }
    payment_records: {
        transaction_hash: string
        amount_paid: number
        listings: {
            title: string
        }
    }
}

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [filter, setFilter] = useState('all')
    const supabase = createClient()

    useEffect(() => {
        checkAdminAndFetch()
    }, [])

    async function checkAdminAndFetch() {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('users')
                .select('is_admin')
                .eq('id', user.id)
                .single()

            if (!profile?.is_admin) {
                setIsAdmin(false)
                setLoading(false)
                return
            }

            setIsAdmin(true)
            fetchDisputes()
        } catch (err) {
            setLoading(false)
        }
    }

    async function fetchDisputes() {
        const { data, error } = await supabase
            .from('disputes')
            .select(`
        *,
        users (username),
        payment_records (
          transaction_hash,
          amount_paid,
          listings (title)
        )
      `)
            .order('created_at', { ascending: false })

        if (!error) setDisputes(data || [])
        setLoading(false)
    }

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const response = await fetch(`/api/disputes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })

        if (response.ok) fetchDisputes()
    }

    const filteredDisputes = disputes.filter(d =>
        filter === 'all' ? true : d.status === filter
    )

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    )

    if (!isAdmin) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle size={64} className="text-amber-500 mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-slate-400 mb-8 max-w-sm">You do not have administrative privileges to view this page.</p>
            <Link href="/" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">
                Return Home
            </Link>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="text-primary" size={24} />
                            <span className="text-xs font-bold text-primary tracking-widest uppercase">Admin Dashboard</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white">Dispute Management</h1>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
                        {['all', 'pending', 'under_review', 'resolved'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${filter === s
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/50">
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Dispute / Payment</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredDisputes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center text-slate-500 italic">
                                            No disputes found matching the selected filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDisputes.map((dispute) => (
                                        <tr key={dispute.id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold mb-1 group-hover:text-primary transition-colors">
                                                        {dispute.payment_records.listings.title}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-mono">
                                                        TX: {dispute.payment_records.transaction_hash.slice(0, 10)}...
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="text-sm text-slate-300">@{dispute.users.username || 'unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm text-slate-400 max-w-xs truncate" title={dispute.reason}>
                                                    {dispute.reason}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${dispute.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    dispute.status === 'under_review' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        dispute.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${dispute.status === 'pending' ? 'bg-amber-500 animate-pulse' :
                                                        dispute.status === 'under_review' ? 'bg-blue-500' :
                                                            dispute.status === 'resolved' ? 'bg-emerald-500' :
                                                                'bg-slate-500'
                                                        }`} />
                                                    {dispute.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-500">
                                                {new Date(dispute.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/disputes/${dispute.id}`}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                                        title="View Detail"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    {dispute.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(dispute.id, 'under_review')}
                                                            className="p-2 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-lg transition-all"
                                                            title="Start Review"
                                                        >
                                                            <Search size={18} />
                                                        </button>
                                                    )}
                                                    {(dispute.status === 'pending' || dispute.status === 'under_review') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleUpdateStatus(dispute.id, 'resolved')}
                                                                className="p-2 text-emerald-400 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-all"
                                                                title="Resolve (No Refund)"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(dispute.id, 'refunded')}
                                                                className="p-2 text-primary hover:text-white hover:bg-primary/20 rounded-lg transition-all"
                                                                title="Approve & Refund"
                                                            >
                                                                <CreditCard size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
