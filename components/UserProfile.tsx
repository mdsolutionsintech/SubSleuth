import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, CreditCard, Zap, Check, Bell, Smartphone, Save, LogOut, Crown, Tag, Trash2, Plus } from 'lucide-react';
import { ToastType, Category } from '../types';
import { supabase } from '../services/supabaseClient';

interface UserProfileProps {
  showToast: (msg: string, type: ToastType) => void;
  currencySymbol: string;
  session: any;
  onSignOut: () => void;
  customCategories: Category[];
  onDeleteCategory: (id: string) => void;
  onAddCategory: (name: string) => Promise<void>;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  showToast, 
  currencySymbol, 
  session, 
  onSignOut,
  customCategories,
  onDeleteCategory,
  onAddCategory
}) => {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  
  useEffect(() => {
    // Fetch profile data on mount
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        setFullName(data.full_name || '');
      }
    };
    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        id: session.user.id,
        full_name: fullName,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      showToast('Profile updated successfully', 'success');
    } catch (error: any) {
      showToast('Error updating profile', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      await onAddCategory(newCatName);
      setNewCatName('');
    } finally {
      setAddingCat(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account & Billing</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your Pro plan, payment methods, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Subscription & Billing */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pro Plan Card */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/20 dark:border dark:border-slate-800">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-3xl rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 p-1.5 rounded-lg">
                    <Crown className="w-5 h-5 fill-yellow-900" />
                  </div>
                  <span className="font-bold text-amber-100 uppercase tracking-wider text-sm">Current Plan</span>
                </div>
                <h3 className="text-3xl font-bold">SubSleuth Pro</h3>
                <p className="text-slate-400 mt-2">Next billing date: <span className="text-white font-medium">December 24, 2023</span></p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-white">{currencySymbol}9.99</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                   <span className="text-slate-300 font-medium">Unlimited Subscriptions</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                   <span className="text-slate-300 font-medium">AI Cancellation Guides</span>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                   <span className="text-slate-300 font-medium">Smart Renewal Alerts</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                   <span className="text-slate-300 font-medium">Priority Deal Finder</span>
                 </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={() => showToast('Billing portal opening...', 'info')} className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                Manage Subscription
              </button>
              <button className="text-slate-400 px-4 py-2.5 hover:text-white transition-colors font-medium">
                Downgrade Plan
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              Payment Methods
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                    <span className="font-bold text-slate-500 dark:text-slate-300 text-xs italic">VISA</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Visa ending in 4242</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Expiry 12/25</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">Default</span>
              </div>
              
              <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 font-semibold hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
                 <CreditCard className="w-4 h-4" /> Add Payment Method
              </button>
            </div>
          </div>

           {/* Custom Categories Manager */}
           <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              Custom Categories
            </h3>
            
            <div className="space-y-6">
               {/* Add New Input */}
               <form onSubmit={handleAddCatSubmit} className="flex gap-2">
                 <input 
                   type="text" 
                   value={newCatName}
                   onChange={e => setNewCatName(e.target.value)}
                   placeholder="Enter new category name..."
                   className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                 />
                 <button 
                   type="submit" 
                   disabled={addingCat || !newCatName}
                   className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                 >
                    {addingCat ? <Plus className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                 </button>
               </form>

               {/* List */}
               {customCategories.length === 0 ? (
                 <p className="text-sm text-slate-400 italic text-center py-4">No custom categories defined.</p>
               ) : (
                 <div className="flex flex-wrap gap-2">
                   {customCategories.map((cat) => (
                     <div key={cat.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 group">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                       <button 
                         onClick={() => onDeleteCategory(cat.id)}
                         className="text-slate-400 hover:text-rose-500 transition-colors"
                         title="Delete category"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Right Column - User Info & Settings */}
        <div className="space-y-8">
           
           {/* Profile Details */}
           <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                Profile Details
              </h3>
              
              <div className="space-y-5">
                <div className="flex justify-center mb-6">
                   <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 relative group cursor-pointer overflow-hidden">
                      <User className="w-10 h-10" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold">Change</span>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                       type="text" 
                       value={fullName}
                       onChange={(e) => setFullName(e.target.value)}
                       placeholder="John Doe"
                       className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium dark:text-white" 
                     />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                       type="email" 
                       value={session.user.email} 
                       disabled
                       className="w-full pl-10 p-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-medium text-slate-500 cursor-not-allowed" 
                     />
                   </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                >
                  {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
           </div>

           {/* Preferences */}
           <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                Preferences
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400"><Bell className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Email Alerts</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Get renewal reminders</p>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400"><Shield className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Deal Finder Updates</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Weekly savings report</p>
                      </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
              </div>
           </div>
           
           <button 
             onClick={onSignOut}
             className="w-full py-3 border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex items-center justify-center gap-2"
           >
              <LogOut className="w-4 h-4" /> Sign Out
           </button>

        </div>
      </div>
    </div>
  );
};