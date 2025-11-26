import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // If auto-confirm is enabled in Supabase, data.session will be present 
        // and the App component will automatically handle the login via onAuthStateChange.
        if (data.session) {
          setMessage('Account created! Signing in...');
        } else {
          // If email confirmation is required or implicit, prompt user to sign in.
          // We automatically switch to the Sign In view for better UX.
          setMessage('Account created successfully! Please sign in.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url('https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2670&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">SubSleuth</h1>
          <p className="text-slate-500 dark:text-slate-400">Take control of your recurring expenses.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400 text-sm rounded-xl font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }}
                className="ml-2 text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 p-4 text-center border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400">Protected by Supabase Auth</p>
        </div>
      </div>
    </div>
  );
};