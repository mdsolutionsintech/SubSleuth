import React, { useState } from 'react';
import { Subscription } from '../types';
import { PlusCircle, X, AlertCircle, Plus } from 'lucide-react';

interface AddSubscriptionFormProps {
  onAdd: (sub: Subscription) => void;
  onCancel: () => void;
  currencySymbol: string;
  availableCategories: string[];
  onAddCategory: (name: string) => Promise<void>;
}

export const AddSubscriptionForm: React.FC<AddSubscriptionFormProps> = ({ 
  onAdd, 
  onCancel, 
  currencySymbol, 
  availableCategories,
  onAddCategory 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    category: 'Streaming',
    billingCycle: 'monthly',
    renewalDate: new Date().toISOString().split('T')[0]
  });
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const costValue = parseFloat(formData.cost);

    if (isNaN(costValue) || costValue <= 0) {
      setError('Please enter a valid positive cost greater than 0.');
      return;
    }
    
    // Prevent submitting if in the middle of creating a category
    if (isCreatingCategory) {
       setError('Please save or cancel the new category first.');
       return;
    }

    const newSub: Subscription = {
      id: crypto.randomUUID(),
      name: formData.name,
      cost: costValue,
      category: formData.category,
      billingCycle: formData.billingCycle as 'monthly' | 'yearly',
      renewalDate: formData.renewalDate
    };
    onAdd(newSub);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__NEW__') {
      setIsCreatingCategory(true);
      setNewCategoryName('');
    } else {
      setFormData({ ...formData, category: value });
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      setIsCreatingCategory(false);
      return;
    }
    
    setLoadingCategory(true);
    try {
      await onAddCategory(newCategoryName);
      setFormData({ ...formData, category: newCategoryName });
      setIsCreatingCategory(false);
    } catch (err) {
      // Error handling managed by parent (toast)
    } finally {
      setLoadingCategory(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 p-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-6 h-6" />
          Track New Subscription
        </h2>
        <button onClick={onCancel} className="text-blue-100 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl border border-rose-100 dark:border-rose-900/50 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Service Name</label>
          <input
            required
            type="text"
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
            placeholder="e.g. Netflix, Spotify, AWS"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cost</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">{currencySymbol}</span>
              <input
                required
                type="number"
                step="0.01"
                className={`w-full pl-9 p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-slate-400 dark:text-white ${error && (parseFloat(formData.cost) <= 0 || isNaN(parseFloat(formData.cost))) ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'}`}
                placeholder="0.00"
                value={formData.cost}
                onChange={e => {
                  setFormData({...formData, cost: e.target.value});
                  if (error) setError(null);
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Billing Cycle</label>
            <select
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer dark:text-white"
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
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
            
            {isCreatingCategory ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="New category..."
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveCategory();
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={handleSaveCategory}
                  disabled={loadingCategory}
                  className="bg-blue-600 text-white px-3 rounded-xl hover:bg-blue-700"
                >
                  {loadingCategory ? '...' : <Plus className="w-5 h-5" />}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsCreatingCategory(false)}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 px-3 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <select
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer dark:text-white"
                value={formData.category}
                onChange={handleCategoryChange}
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option disabled className="bg-slate-100 dark:bg-slate-800 text-xs py-1">─────</option>
                <option value="__NEW__" className="text-blue-600 dark:text-blue-400 font-bold">+ Create New Category</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Next Renewal</label>
            <input
              required
              type="date"
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:[color-scheme:dark]"
              value={formData.renewalDate}
              onChange={e => setFormData({...formData, renewalDate: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Add Subscription
          </button>
        </div>
      </form>
    </div>
  );
};