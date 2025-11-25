import React from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GuideState } from '../types';

interface CancelGuideModalProps {
  guideState: GuideState;
  onClose: () => void;
}

export const CancelGuideModal: React.FC<CancelGuideModalProps> = ({ guideState, onClose }) => {
  if (!guideState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">How to Cancel {guideState.serviceName}</h2>
            <p className="text-sm text-gray-500">AI-Generated Step-by-Step Guide</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto prose prose-blue prose-sm max-w-none">
          {guideState.loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-500">Analyze patterns... Generatiing guide...</p>
            </div>
          ) : (
            <>
               <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Always double-check the official website. This guide is AI-generated and processes may change.
                  </p>
                </div>
              </div>
              <div className="markdown-body text-gray-700">
                <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer" />
                  }}
                >
                  {guideState.content || ""}
                </ReactMarkdown>
              </div>
              
              {/* Affiliate/Monetization Hook inside Guide */}
              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                <p className="text-green-800 font-medium mb-2">Want someone else to do it for you?</p>
                <a href="#" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm">
                  Use Rocket Money (Partner Link)
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};