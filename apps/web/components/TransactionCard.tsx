import React from 'react';
import { FileText, Users, CheckCircle2, XCircle } from 'lucide-react';

export const TransactionCard = ({ amount, date, type, roommates, status, property }) => {
  const isRent = type === "Rent Paid";
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-3 flex items-center justify-between transition-all hover:shadow-md">
      <div className="flex items-center space-x-4">
        {/* Status Icon */}
        <div className={status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>
          {status === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h4 className={`font-bold text-lg ${status === 'failed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              ${amount}
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              isRent ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            }`}>
              {type}
            </span>
          </div>
          <p className="text-xs text-gray-500">{date} • {property}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Roommate Contribution Badge */}
        {roommates && (
          <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg text-xs text-gray-600 dark:text-gray-300">
            <Users size={12} className="mr-1.5" />
            Split: {roommates}
          </div>
        )}
        
        {/* Download Receipt Button */}
        <button 
          className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
          title="Download PDF Receipt"
        >
          <FileText size={20} />
        </button>
      </div>
    </div>
  );
};
