import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LayoutDashboard, Search, Plus, Wallet, Menu, X, Globe } from 'lucide-react';

import { Subscription, View, GuideState } from './types';
import { SubscriptionList } from './components/SubscriptionList';
import { AddSubscriptionForm } from './components/AddSubscriptionForm';
import { DealFinder } from './components/DealFinder';
import { CancelGuideModal } from './components/CancelGuideModal';
import { AdBanner } from './components/AdBanner';
import { getCancellationGuide } from './services/geminiService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Mock initial data
const INITIAL_SUBS: Subscription[] = [
  { id: '1', name: 'Netflix', cost: 15.99, billingCycle: 'monthly', category: 'Streaming', renewalDate: '2023-11-15' },
  { id: '2', name: 'Adobe Creative Cloud', cost: 54.99, billingCycle: 'monthly', category: 'Software', renewalDate: '2023-11-20' },
  { id: '3', name: 'Gym Membership', cost: 40.00, billingCycle: 'monthly', category: 'Fitness', renewalDate: '2023-11-01' },
];

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
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('USD');
  
  // Guide Modal State
  const [guideState, setGuideState] = useState<GuideState>({
    serviceName: '',
    loading: false,
    content: null,
    isOpen: false
  });

  const activeCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  // Calculate totals
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
      return acc + monthlyCost;
    }, 0);
  }, [subscriptions]);

  const chartData = useMemo(() => {
    const categories: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
      categories[sub.category] = (categories[sub.category] || 0) + monthlyCost;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  const handleAddSub = (sub: Subscription) => {
    setSubscriptions([...subscriptions, sub]);
    setView(View.DASHBOARD);
  };

  const handleRemoveSub = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
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
    }
  };

  const NavItem = ({ target, icon: Icon, label }: { target: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setView(target);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left mb-1 ${
        view === target 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    // Main Container with Background Image
    <div 
      className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.92), rgba(248, 250, 252, 0.95)), url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/90 backdrop-blur-md border-r border-slate-200/60 shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <Search className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">SubSleuth</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          <NavItem target={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem target={View.ADD_SUB} icon={Plus} label="Add Subscription" />
          <NavItem target={View.DEAL_FINDER} icon={Search} label="Deal Finder" />
        </nav>

        <div className="absolute bottom-0 w-full p-6 space-y-6 bg-gradient-to-t from-white via-white to-transparent">
           
           {/* Currency Selector */}
           <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> Region & Currency
              </label>
              <select 
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.label}</option>
                ))}
              </select>
           </div>

           <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100/50 shadow-sm">
             <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Total Monthly</h4>
             <p className="text-3xl font-extrabold text-slate-800">
               {activeCurrency.symbol}{totalMonthly.toFixed(2)}
             </p>
             <p className="text-xs text-indigo-400 mt-1 font-medium">Estimated cost</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-y-auto h-screen scroll-smooth">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20">
          <span className="font-bold text-lg text-slate-800">SubSleuth</span>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {view === View.DASHBOARD && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Your Dashboard</h2>
                <p className="text-slate-500 mt-1">Track spending and manage renewals efficiently</p>
              </div>
              <button 
                onClick={() => setView(View.ADD_SUB)}
                className="bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add New Subscription
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Card */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-500" />
                  Cost Distribution
                </h3>
                <div className="flex-1 min-h-[220px] w-full relative">
                   {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => `${activeCurrency.symbol}${value.toFixed(2)}`} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                       No data to display
                     </div>
                   )}
                </div>
                <div className="mt-6 space-y-2">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-slate-600">{entry.name}</span>
                      </div>
                      <span className="font-medium text-slate-900">{activeCurrency.symbol}{entry.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub List */}
              <div className="md:col-span-2">
                <SubscriptionList 
                  subscriptions={subscriptions} 
                  onRemove={handleRemoveSub}
                  onViewGuide={openGuide}
                  currencySymbol={activeCurrency.symbol}
                />
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
            />
          </div>
        )}

        {view === View.DEAL_FINDER && (
          <div className="animate-in fade-in duration-300 pt-6">
            <DealFinder currency={activeCurrency} />
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