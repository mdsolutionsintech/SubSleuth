import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { getAlternatives } from '../services/geminiService';
import { SearchState } from '../types';
import { AdBanner } from './AdBanner';

interface DealFinderProps {
  currency: {
    code: string;
    symbol: string;
  };
}

export const DealFinder: React.FC<DealFinderProps> = ({ currency }) => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    loading: false,
    results: null,
    error: null,
  });
  
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchState.query.trim()) return;

    setSearchState(prev => ({ ...prev, loading: true, error: null, results: null }));

    try {
      const results = await getAlternatives(searchState.query, currency.code);
      setSearchState(prev => ({ ...prev, loading: false, results }));
    } catch (err) {
      setSearchState(prev => ({ ...prev, loading: false, error: "Failed to fetch alternatives. Please try again." }));
    }
  };

  const handleCopyLink = (name: string, index: number) => {
    const dummyLink = `https://subsleuth.app/deal/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    navigator.clipboard.writeText(dummyLink);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10 pt-4">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Stop Overpaying. Find Better Deals.</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Enter a service you want to replace (e.g., "Adobe Premiere", "Netflix")</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-12">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            value={searchState.query}
            onChange={(e) => setSearchState(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Search for a service..."
            className="w-full pl-14 pr-32 py-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm focus:shadow-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-lg outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white"
          />
          <button 
            type="submit"
            disabled={searchState.loading || !searchState.query}
            className="absolute right-2.5 top-2.5 bottom-2.5 bg-slate-900 dark:bg-blue-600 text-white px-8 rounded-full font-semibold hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            {searchState.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find Deals'}
          </button>
        </div>
      </form>

      {searchState.error && (
        <div className="text-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 p-4 rounded-xl mb-8 animate-in fade-in">
          {searchState.error}
        </div>
      )}

      {/* Results Section */}
      {searchState.results && (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Top Alternatives for "{searchState.query}"</h3>
              <span className="flex items-center gap-1 text-sm bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-4 py-1.5 rounded-full font-semibold border border-green-200 dark:border-green-800">
                AI Recommendations in {currency.code}
              </span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {searchState.results.map((alt, idx) => (
               <div key={idx} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col h-full relative group ring-0 hover:ring-4 hover:ring-blue-500/10">
                  {/* Highlight Badge for first item */}
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl z-10 shadow-sm">
                      BEST VALUE
                    </div>
                  )}
                  
                  <div className="p-8 flex-1">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{alt.name}</h4>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">{alt.priceDescription}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      {alt.savingsDescription}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {alt.keyFeatures.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-md group-hover:shadow-lg">
                          <span>Get Deal</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleCopyLink(alt.name, idx)}
                            className="flex items-center justify-center w-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 transition-all shadow-sm"
                            title="Copy Affiliate Link"
                        >
                            {copiedIndex === idx ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3 font-medium uppercase tracking-wide">Secure Affiliate Link</p>
                  </div>
               </div>
             ))}
           </div>

           <AdBanner slot="deal-finder-bottom" />
        </div>
      )}
    </div>
  );
};