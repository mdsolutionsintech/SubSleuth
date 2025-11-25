import React, { useState } from 'react';
import { Subscription } from '../types';
import { PlusCircle, X } from 'lucide-react';

interface AddSubscriptionFormProps {
  onAdd: (sub: Subscription) => void;
  onCancel: () => void;
  currencySymbol: string;
}

export const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({ onAdd, onCancel, currencySymbol }) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    category: 'Streaming',
    billingCycle: 'monthly',
    renewalDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subscription = {
      id: crypto.randomUUID(),
      name: formData.name,
      cost: parseFloat(formData.cost),
      category: formData.category,
      billingCycle: formData.billingCycle as 'monthly' | 'yearly',
      renewalDate: formData.renewalDate
    };
    onAdd(newSub);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6" />
          Track New Subscription
        </h2>
        <button onClick={onCancel} className="text-blue-100 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Service Name</label>
          <input
            required
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            placeholder="e.g. Netflix, Spotify, AWS"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cost</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{currencySymbol}</span>
              <input
                required
                type="number"
                step="0.01"
                className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                placeholder="0.00"
                value={formData.cost}
                onChange={e => setFormData({...formData, cost: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Billing Cycle</label>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              value={formData.billingCycle}
              onChange={e => setFormData({...formData, billingCycle: e.target.value})}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Streaming">Streaming</option>
              <option value="Software">Software</option>
              <option value="Fitness">Fitness</option>
              <option value="Utilities">Utilities</option>
              <option value="Gaming">Gaming</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Next Renewal</label>
            <input
              required
              type="date"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.renewalDate}
              onChange={e => setFormData({...formData, renewalDate: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Add Subscription
          </button>
        </div>
      </form>
    </div>
  );
};