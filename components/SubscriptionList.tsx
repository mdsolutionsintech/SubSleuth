import React from 'react';
import { Subscription } from '../types';
import { Trash2, FileText, Calendar, CreditCard, ChevronRight } from 'lucide-react';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onRemove: (id: string) => void;
  onViewGuide: (name: string) => void;
  currencySymbol: string;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions, onRemove, onViewGuide, currencySymbol }) => {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">No subscriptions tracked</h3>
        <p className="text-slate-500 mt-2">Add your first subscription to start saving.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {subscriptions.map((sub) => (
        <div key={sub.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-lg hover:border-blue-100 transition-all duration-200">
          <div className="flex-1 w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100 shadow-sm">
                {sub.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{sub.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{sub.category}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 capitalize">{sub.billingCycle}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
               <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                 <Calendar className="w-3.5 h-3.5" />
                 <span>Renews: {new Date(sub.renewalDate).toLocaleDateString()}</span>
               </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-6 flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-1 min-w-[120px]">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{currencySymbol}{sub.cost.toFixed(2)}</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">per {sub.billingCycle === 'monthly' ? 'month' : 'year'}</span>
          </div>

          <div className="mt-5 md:mt-0 md:ml-8 flex gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
            <button
              onClick={() => onViewGuide(sub.name)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <FileText className="w-4 h-4" />
              Cancel Guide
            </button>
            <button
              onClick={() => onRemove(sub.id)}
              className="flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-colors"
              title="Remove from list"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};