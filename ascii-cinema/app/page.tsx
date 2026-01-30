'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, RefreshCw, Loader2, Monitor } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generate = async () => {
    if (!prompt) return;
    setLoading(true);
    setIsPlaying(false);
    setFrames([]);
    
    try {
      const res = await fetch('/api/ascii', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setFrames(data.frames);
      setCurrentFrame(0);
      setIsPlaying(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
      }, 200); // 5 FPS
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, frames]);

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Terminal size={40} />
            MiniMax ASCII Cinema
          </h1>
          <p className="text-green-800">Powered by MiniMax M2.1</p>
        </div>

        {/* Screen */}
        <div className="relative aspect-video bg-zinc-900 rounded-lg border-4 border-zinc-800 shadow-[0_0_50px_rgba(34,197,94,0.2)] overflow-hidden flex items-center justify-center">
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
          
          <div className="relative z-0 p-8 w-full h-full flex items-center justify-center overflow-hidden">
            {loading ? (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 size={48} className="animate-spin" />
                    <p>GENERATING FRAMES...</p>
                </div>
            ) : frames.length > 0 ? (
                <pre className="text-xs md:text-sm leading-none whitespace-pre font-bold text-green-400">
                    {frames[currentFrame]}
                </pre>
            ) : (
                <div className="text-center opacity-50">
                    <Monitor size={64} className="mx-auto mb-4" />
                    <p>READY FOR INPUT</p>
                </div>
            )}
          </div>
          
          {/* Frame Counter */}
          {frames.length > 0 && (
              <div className="absolute bottom-4 right-4 text-xs bg-black/50 px-2 py-1 rounded z-20">
                  FRAME {currentFrame + 1}/{frames.length}
              </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder="Describe your scene (e.g., 'A rocket launching into space')" 
            className="flex-1 bg-zinc-900 border border-green-900 rounded-xl px-4 py-3 text-green-400 focus:ring-2 focus:ring-green-500 outline-none placeholder:text-green-900"
          />
          <div className="flex gap-2">
            <button 
                onClick={generate}
                disabled={loading || !prompt}
                className="bg-green-600 text-black px-6 py-3 rounded-xl font-bold hover:bg-green-500 disabled:opacity-50 transition-all flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                GENERATE
            </button>
            {frames.length > 0 && (
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-zinc-800 border border-green-900 text-green-500 px-6 py-3 rounded-xl font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
                >
                    {isPlaying ? <Pause /> : <Play />}
                </button>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
