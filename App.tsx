import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LayoutDashboard, Search, Plus, Wallet, Menu, X, Globe, User, Bell, LogOut, TrendingUp, Calendar, ArrowUpRight, Loader2, Moon, Sun } from 'lucide-react';
import { supabase } from './services/supabaseClient';

import { Subscription, View, GuideState, ToastMessage, ToastType, Category } from './types';
import { SubscriptionList } from './components/SubscriptionList';
import { AddSubscriptionForm } from './components/AddSubscriptionForm';
import { DealFinder } from './components/DealFinder';
import { CancelGuideModal } from './components/CancelGuideModal';
import { AdBanner } from './components/AdBanner';
import { ToastContainer } from './components/Toast';
import { UserProfile } from './components/UserProfile';
import { Auth } from './components/Auth';
import { getCancellationGuide } from './services/geminiService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6', '#f97316'];

const DEFAULT_CATEGORIES = ['Streaming', 'Software', 'Fitness', 'Utilities', 'Gaming', 'Other'];

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'United States Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
];

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Guide Modal State
  const [guideState, setGuideState] = useState<GuideState>({
    serviceName: '',
    loading: false,
    content: null,
    isOpen: false
  });

  const activeCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  // Dark Mode Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Combine defaults with custom categories for UI usage
  const allCategories = useMemo(() => {
    const customNames = customCategories.map(c => c.name);
    // Filter out potential duplicates if user adds a name that matches default
    return [...DEFAULT_CATEGORIES, ...customNames.filter(n => !DEFAULT_CATEGORIES.includes(n))];
  }, [customCategories]);

  // Auth & Data Fetching Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data when session exists
  useEffect(() => {
    if (session) {
      fetchSubscriptions();
      fetchCategories();
    }
  }, [session]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Map snake_case to camelCase
        const mappedSubs: Subscription[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          cost: item.cost,
          billingCycle: item.billing_cycle,
          category: item.category,
          renewalDate: item.renewal_date
        }));
        setSubscriptions(mappedSubs);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('user_categories')
        .select('*');
      
      if (error) {
        // Silent fail if table doesn't exist yet (for new deployments)
        console.log('Categories fetch info:', error.message);
        return;
      }
      
      if (data) {
        setCustomCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Toast Helper
  const showToast = (message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Calculate totals
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
      return acc + monthlyCost;
    }, 0);
  }, [subscriptions]);

  const totalYearly = totalMonthly * 12;

  // Find next renewal
  const nextRenewal = useMemo(() => {
    if (subscriptions.length === 0) return null;
    const sorted = [...subscriptions].sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
    return sorted[0];
  }, [subscriptions]);

  const chartData = useMemo(() => {
    const categories: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
      categories[sub.category] = (categories[sub.category] || 0) + monthlyCost;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  const handleAddCategory = async (name: string) => {
    if (allCategories.includes(name)) {
      return; // Already exists
    }
    
    try {
      const { data, error } = await supabase.from('user_categories').insert([
        { user_id: session.user.id, name: name }
      ]).select().single();

      if (error) throw error;
      
      if (data) {
        setCustomCategories([...customCategories, data]);
        showToast(`Category "${name}" created`, 'success');
      }
    } catch (error: any) {
      console.error("Add category error", error);
      showToast("Failed to create category", 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('user_categories').delete().eq('id', id);
      if (error) throw error;
      
      setCustomCategories(customCategories.filter(c => c.id !== id));
      showToast("Category deleted", 'info');
    } catch (error: any) {
      console.error("Delete category error", error);
      showToast("Failed to delete category", 'error');
    }
  };

  const handleAddSub = async (sub: Subscription) => {
    try {
      // Optimistic Update
      setSubscriptions([...subscriptions, sub]);
      setView(View.DASHBOARD);

      // Save to Supabase
      const { error } = await supabase.from('subscriptions').insert([
        {
          id: sub.id,
          user_id: session.user.id,
          name: sub.name,
          cost: sub.cost,
          billing_cycle: sub.billingCycle,
          category: sub.category,
          renewal_date: sub.renewalDate
        }
      ]);

      if (error) throw error;
      showToast(`Successfully tracked ${sub.name}`, 'success');

    } catch (error: any) {
      console.error("Add error", error);
      showToast("Failed to save to database.", 'error');
    }
  };

  const handleRemoveSub = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    // Optimistic Update
    setSubscriptions(subscriptions.filter(s => s.id !== id));

    try {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
      showToast(`Removed ${sub?.name || 'subscription'}`, 'info');
    } catch (error) {
      console.error("Delete error", error);
      showToast("Failed to delete from database", 'error');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSubscriptions([]);
    setCustomCategories([]);
    setView(View.DASHBOARD);
  };

  const openGuide = async (name: string) => {
    setGuideState({
      serviceName: name,
      loading: true,
      content: null,
      isOpen: true
    });

    try {
      const guide = await getCancellationGuide(name);
      setGuideState(prev => ({ ...prev, loading: false, content: guide }));
    } catch (error) {
      setGuideState(prev => ({ ...prev, loading: false, content: "Error loading guide. Please try again." }));
      showToast("Failed to generate guide", 'error');
    }
  };

  const NavItem = ({ target, icon: Icon, label }: { target: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setView(target);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left mb-1.5 font-medium ${
        view === target 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <Icon className={`w-5 h-5 ${view === target ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Calculate background style based on theme
  const backgroundStyle = {
    backgroundImage: darkMode 
      ? `linear-gradient(rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.98)), url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`
      : `linear-gradient(rgba(241, 245, 249, 0.94), rgba(248, 250, 252, 0.96)), url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    // Main Container with Background Image
    <div 
      className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 relative font-inter transition-colors duration-300"
      style={backgroundStyle}
    >
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-8 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-blue-500/30 shadow-lg">
               <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">SubSleuth</h1>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">Premium</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 py-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</p>
          <nav className="space-y-1">
            <NavItem target={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavItem target={View.ADD_SUB} icon={Plus} label="Add Subscription" />
            <NavItem target={View.DEAL_FINDER} icon={Search} label="Deal Finder" />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6">
           {/* Dark Mode Toggle */}
           <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
             <button 
               onClick={() => setDarkMode(false)}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${!darkMode ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
             >
               <Sun className="w-4 h-4" /> Light
             </button>
             <button 
               onClick={() => setDarkMode(true)}
               className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${darkMode ? 'bg-slate-700 shadow-sm text-white' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <Moon className="w-4 h-4" /> Dark
             </button>
           </div>

           {/* Currency Selector */}
           <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Globe className="w-3.5 h-3.5" /> Region
              </label>
              <div className="relative">
                <select 
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} &mdash; {c.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
           </div>

           {/* User Profile - Clickable to go to Profile View */}
           <button 
             onClick={() => setView(View.PROFILE)}
             className={`w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-4 border shadow-sm flex items-center gap-3 transition-all hover:scale-[1.02] hover:shadow-md text-left group ${view === View.PROFILE ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700'}`}
           >
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{session.user.email.split('@')[0]}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Pro Plan</p>
              </div>
              <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                 <ArrowUpRight className="w-4 h-4" />
              </div>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-80 p-6 md:p-10 overflow-y-auto h-screen scroll-smooth">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <span className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div> SubSleuth
          </span>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {view === View.DASHBOARD && (
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Welcome back, here is your financial overview.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
                  <Bell className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setView(View.ADD_SUB)}
                  className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Add Subscription
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Monthly Spend */}
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700/50 flex flex-col justify-between group hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                 <div className="flex items-start justify-between">
                    <div>
                       <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Spend</p>
                       <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2">{activeCurrency.symbol}{totalMonthly.toFixed(2)}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                       <Wallet className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="mt-6 flex items-center gap-2 text-sm">
                    <span className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-md font-bold">
                       <ArrowUpRight className="w-3 h-3 mr-1" /> 2.4%
                    </span>
                    <span className="text-slate-400">vs last month</span>
                 </div>
              </div>

              {/* Card 2: Yearly Projection */}
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700/50 flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                 <div className="flex items-start justify-between">
                    <div>
                       <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yearly Projection</p>
                       <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2">{activeCurrency.symbol}{totalYearly.toFixed(2)}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                       <TrendingUp className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="mt-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Based on <span className="font-bold text-slate-900 dark:text-white">{subscriptions.length}</span> active subscriptions</p>
                 </div>
              </div>

              {/* Card 3: Next Renewal */}
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-white/50 dark:border-slate-700/50 flex flex-col justify-between group hover:border-rose-200 dark:hover:border-rose-700 transition-colors">
                 <div className="flex items-start justify-between">
                    <div>
                       <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Next Renewal</p>
                       <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 truncate max-w-[180px]">
                         {nextRenewal ? nextRenewal.name : 'None'}
                       </h3>
                       <p className="text-rose-600 dark:text-rose-400 font-bold mt-1">
                         {nextRenewal ? new Date(nextRenewal.renewalDate).toLocaleDateString() : '--'}
                       </p>
                    </div>
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
                       <Calendar className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="mt-6">
                   {nextRenewal && (
                     <button onClick={() => openGuide(nextRenewal.name)} className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                        View Cancellation Guide &rarr;
                     </button>
                   )}
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sub List - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <SubscriptionList 
                  subscriptions={subscriptions} 
                  onRemove={handleRemoveSub}
                  onViewGuide={openGuide}
                  currencySymbol={activeCurrency.symbol}
                />
              </div>

               {/* Stats Card - Takes up 1 column */}
               <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-white/60 dark:border-slate-700/60 flex flex-col h-fit">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                  Distribution
                </h3>
                <div className="flex-1 min-h-[300px] w-full relative">
                   {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={6}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px 16px',
                            fontWeight: 600,
                            backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                            color: darkMode ? '#ffffff' : '#0f172a'
                          }}
                          itemStyle={{
                             color: darkMode ? '#e2e8f0' : '#334155'
                          }}
                          formatter={(value: number) => `${activeCurrency.symbol}${value.toFixed(2)}`} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
                       Add subscriptions to visualize data
                     </div>
                   )}
                </div>
                <div className="mt-8 space-y-3">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm group">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{activeCurrency.symbol}{entry.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <AdBanner slot="dashboard-footer" />
          </div>
        )}

        {view === View.ADD_SUB && (
          <div className="animate-in slide-in-from-right duration-300 max-w-2xl mx-auto pt-10">
            <AddSubscriptionForm 
              onAdd={handleAddSub} 
              onCancel={() => setView(View.DASHBOARD)} 
              currencySymbol={activeCurrency.symbol}
              availableCategories={allCategories}
              onAddCategory={handleAddCategory}
            />
          </div>
        )}

        {view === View.DEAL_FINDER && (
          <div className="animate-in fade-in duration-300 pt-6">
            <DealFinder currency={activeCurrency} />
          </div>
        )}

        {view === View.PROFILE && (
          <div className="animate-in fade-in duration-300 pt-6">
             <UserProfile 
               showToast={showToast} 
               currencySymbol={activeCurrency.symbol} 
               session={session}
               onSignOut={handleSignOut}
               customCategories={customCategories}
               onDeleteCategory={handleDeleteCategory}
               onAddCategory={handleAddCategory}
             />
          </div>
        )}
      </main>

      <CancelGuideModal 
        guideState={guideState} 
        onClose={() => setGuideState(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}