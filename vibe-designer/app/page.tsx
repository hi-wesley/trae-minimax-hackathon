'use client';

import { useState } from 'react';
import { Sparkles, Code, Layout, Loader2, Play } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedHtml(null);
    
    try {
      const res = await fetch('/api/generate-ui', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setGeneratedHtml(data.html);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
            MiniMax Vibe Designer
          </h1>
        </div>
        <div className="text-xs text-neutral-500 font-mono">
          Powered by M2.1
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar: Controls */}
        <div className="w-full md:w-[400px] p-6 border-r border-neutral-800 bg-neutral-900 flex flex-col gap-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
              <Layout size={16} />
              Describe your Component
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'A futuristic login form with neon borders that shakes on error', 'A glassmorphism music player card', 'A retro terminal popup'" 
              className="w-full h-40 bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none transition-all placeholder:text-neutral-700"
            />
          </div>

          <button 
            onClick={generate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Play size={18} fill="currentColor" />}
            Generate UI
          </button>

          <div className="mt-auto p-4 bg-neutral-950 rounded-xl border border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Capabilities</h3>
            <ul className="text-xs text-neutral-400 space-y-2">
              <li className="flex items-center gap-2"><Code size={12} className="text-green-500" /> React/HTML/CSS Generation</li>
              <li className="flex items-center gap-2"><Code size={12} className="text-blue-500" /> Embedded Animations</li>
              <li className="flex items-center gap-2"><Code size={12} className="text-purple-500" /> Responsive Layouts</li>
            </ul>
          </div>
        </div>

        {/* Right Area: Preview */}
        <div className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-neutral-950 relative flex items-center justify-center p-8 overflow-hidden">
          
          {!generatedHtml && !loading && (
            <div className="text-center space-y-4 opacity-30">
              <div className="w-24 h-24 bg-neutral-800 rounded-2xl mx-auto flex items-center justify-center border border-neutral-700 border-dashed">
                <Layout size={40} />
              </div>
              <p className="font-mono text-sm">Waiting for prompt...</p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={20} className="text-white animate-pulse" />
                </div>
              </div>
              <p className="mt-4 font-mono text-violet-400 animate-pulse">Designing...</p>
            </div>
          )}

          {generatedHtml && (
            <div className="w-full h-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                {/* Browser Bar Mockup */}
                <div className="h-8 bg-neutral-100 border-b border-neutral-200 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="bg-white rounded-md text-[10px] text-neutral-400 py-0.5 px-12 inline-block shadow-sm">
                            localhost:3000/preview
                        </div>
                    </div>
                </div>
                
                {/* The Iframe */}
                <iframe 
                    srcDoc={generatedHtml}
                    className="w-full h-[calc(100%-32px)] border-none bg-white"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
