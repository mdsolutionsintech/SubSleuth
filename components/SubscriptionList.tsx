import React from 'react';
import { Subscription } from '../types';
import { Trash2, FileText, Calendar, CreditCard } from 'lucide-react';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onRemove: (id: string) => void;
  onViewGuide: (name: string) => void;
  currencySymbol: string;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions, onRemove, onViewGuide, currencySymbol }) => {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 dark:border-slate-700/50">
        <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CreditCard className="w-10 h-10 text-blue-400 dark:text-blue-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">No subscriptions tracked</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Add your first subscription to start saving money.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Your Subscriptions</h3>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{subscriptions.length} Active</span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 dark:border-slate-700/50 p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-xl hover:scale-[1.005] hover:border-blue-200/60 dark:hover:border-blue-600/30 transition-all duration-300">
            <div className="flex-1 w-full md:w-auto">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xl border border-slate-200/60 dark:border-slate-600 shadow-inner">
                  {sub.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{sub.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 uppercase tracking-wide border border-indigo-100 dark:border-indigo-800">{sub.category}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{sub.billingCycle}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:hidden flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-3">
                 <Calendar className="w-4 h-4" />
                 <span>Renews: {new Date(sub.renewalDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center px-8 border-l border-r border-slate-100/50 dark:border-slate-700/50 mx-6 h-12">
               <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                 <Calendar className="w-3 h-3" /> Renewal
               </div>
               <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{new Date(sub.renewalDate).toLocaleDateString()}</span>
            </div>

            <div className="mt-4 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-1 min-w-[100px]">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currencySymbol}{sub.cost.toFixed(2)}</span>
            </div>

            <div className="mt-5 md:mt-0 md:ml-8 flex gap-2 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-4 md:pt-0">
              <button
                onClick={() => onViewGuide(sub.name)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <FileText className="w-4 h-4" />
                Cancel Guide
              </button>
              <button
                onClick={() => onRemove(sub.id)}
                className="flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                title="Remove from list"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};