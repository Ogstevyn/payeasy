import React from 'react';
import { TransactionCard } from '../components/TransactionCard';

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Payment History</h2>
          <p className="text-gray-500 text-sm">Track your rent and security deposits</p>
        </div>
        
        {/* FILTERS */}
        <div className="flex flex-wrap gap-3">
          <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Properties</option>
            <option>Main St. Heights</option>
            <option>Oak Ridge Villa</option>
          </select>
          
          <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Months</option>
            <option>March 2026</option>
            <option>February 2026</option>
          </select>
        </div>
      </header>

      {/* TRANSACTION LIST */}
      <div className="space-y-2">
        <TransactionCard 
            amount="1,450.00" 
            date="March 01, 2026" 
            type="Rent Paid" 
            roommates="2 Roommates" 
            property="Main St. Heights" 
            status="success" 
        />
        <TransactionCard 
            amount="500.00" 
            date="Feb 15, 2026" 
            type="Security Deposit" 
            property="Oak Ridge Villa" 
            status="success" 
        />
        <TransactionCard 
            amount="1,450.00" 
            date="Feb 01, 2026" 
            type="Rent Paid" 
            roommates="2 Roommates" 
            property="Main St. Heights" 
            status="failed" 
        />
      </div>
    </div>
  );
}
