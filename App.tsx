
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, TrendingUp, Zap, Radio, LayoutDashboard, Settings, Loader2, MessageSquare, ChevronRight } from 'lucide-react';
import VibeEarth from './components/VibeEarth';
import SocialFeed from './components/SocialFeed';
import { analyzeTopic } from './services/gemini';
import { VibeData } from './types';

const INITIAL_VIBE: VibeData = {
  score: 0.1,
  summary: "Awaiting topic analysis to determine global pulse.",
  posts: [],
  trend: 'stable'
};

const VibeLoader = () => (
  <Html center>
    <div className="flex flex-col items-center gap-4 bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl min-w-[200px] md:min-w-[240px]">
      <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 animate-spin" />
      <div className="text-center">
        <p className="text-xs md:text-sm font-bold tracking-widest text-white uppercase mb-1">Synchronizing</p>
        <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-tighter">Optimizing 4K Neural Mesh</p>
      </div>
    </div>
  </Html>
);

const App: React.FC = () => {
  const [topic, setTopic] = useState('Artificial Super Intelligence');
  const [vibeData, setVibeData] = useState<VibeData>(INITIAL_VIBE);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isFeedOpen, setIsFeedOpen] = useState(false);

  const performAnalysis = useCallback(async (searchTopic: string) => {
    if (!searchTopic) return;
    setIsLoading(true);
    setIsFeedOpen(false); // Close feed on new search for mobile focus
    try {
      const data = await analyzeTopic(searchTopic);
      setVibeData(data);
      setTopic(searchTopic);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performAnalysis('Artificial Super Intelligence');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performAnalysis(searchInput);
  };

  const getScoreColor = (score: number) => {
    if (score > 0.5) return 'text-emerald-400';
    if (score < -0.5) return 'text-rose-500';
    return 'text-indigo-400';
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:40px_40px]" />

      {/* Navigation Header */}
      <nav className="z-[60] h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 glass">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            <Zap size={18} fill="currentColor" className="md:w-6 md:h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold tracking-tighter uppercase">VibeCheck</h1>
            <p className="text-[8px] md:text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">Pulse OS 3.0</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 md:mx-12">
          <div className="relative group">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Query world sentiment..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 md:py-3 px-10 md:px-12 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-4 md:gap-6">
          <button className="hidden md:block text-slate-400 hover:text-white transition-colors"><Settings size={20} /></button>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 p-0.5 overflow-hidden">
            <img src="https://picsum.photos/id/1025/100/100" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content Dashboard */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Sidebar (Desktop Only) / Bottom Nav (Mobile Only) */}
        <aside className="hidden md:flex w-20 border-r border-white/5 flex-col items-center py-8 gap-8 glass">
           <NavIcon icon={<LayoutDashboard size={22} />} active />
           <NavIcon icon={<TrendingUp size={22} />} />
           <NavIcon icon={<Radio size={22} />} />
           <NavIcon icon={<Info size={22} />} />
        </aside>

        {/* Mobile Bottom Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-white/5 glass z-[70] flex items-center justify-around px-4">
           <NavIcon icon={<LayoutDashboard size={20} />} active />
           <NavIcon icon={<TrendingUp size={20} />} />
           <button onClick={() => setIsFeedOpen(!isFeedOpen)} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isFeedOpen ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              <MessageSquare size={20} />
           </button>
           <NavIcon icon={<Info size={20} />} />
        </nav>

        {/* Center - Visualizer */}
        <div className="flex-1 relative flex flex-col min-h-0">
          {/* Overlay Info - Repositioned for mobile */}
          <div className="absolute top-6 left-6 right-6 md:top-12 md:left-12 z-10 pointer-events-none">
            <motion.div
              key={topic}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-0.5 md:space-y-1"
            >
              <h2 className="text-indigo-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Neural Target</h2>
              <h3 className="text-2xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40 truncate">{topic}</h3>
            </motion.div>

            <motion.div
              key={vibeData.score}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="mt-6 md:mt-16"
            >
              <div className="flex items-baseline gap-2">
                <span className={`text-6xl md:text-9xl font-black tracking-tighter glow-text transition-colors duration-1000 ${getScoreColor(vibeData.score)}`}>
                  {(vibeData.score * 100).toFixed(0)}
                </span>
                <span className="text-slate-600 font-black text-xs md:text-2xl uppercase tracking-widest">Score</span>
              </div>
              <p className="hidden sm:block text-slate-300 text-xs md:text-base max-w-[280px] md:max-w-sm mt-4 md:mt-6 font-medium leading-relaxed glass p-4 md:p-6 rounded-2xl border-l-4 border-l-indigo-500">
                <span className="text-indigo-400 block text-[8px] md:text-[10px] uppercase font-bold mb-1 md:mb-2 tracking-widest">Intelligence Summary</span>
                "{vibeData.summary}"
              </p>
            </motion.div>
          </div>

          {/* 3D Canvas */}
          <div className="w-full h-full absolute inset-0">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={2.5} />
              <pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />
              <Stars radius={150} depth={50} count={5000} factor={6} saturation={0.5} fade speed={2} />
              
              <Suspense fallback={<VibeLoader />}>
                <VibeEarth score={vibeData.score} />
              </Suspense>
              
              <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={15} blur={3} far={10} color="#000000" />
              <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
            </Canvas>
          </div>

          {/* Bottom Stats Grid - Responsive Grid */}
          <div className="absolute bottom-20 md:bottom-8 left-6 right-6 md:left-12 md:right-12 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 pointer-events-none">
            <StatCard label="Tectonic" value={vibeData.score < -0.5 ? "Critical" : "Stable"} warning={vibeData.score < -0.5} />
            <StatCard label="Global Reach" value="2.4B nodes" />
            <StatCard label="Bio-Metrics" value={vibeData.score > 0.5 ? "Flourish" : vibeData.score < -0.5 ? "Collapse" : "Nominal"} glow={vibeData.score > 0.5} />
            <StatCard label="Latency" value="12ms" />
          </div>
        </div>

        {/* Right Sidebar - Adaptive Live Feed */}
        <aside className={`
          fixed md:relative top-16 md:top-0 right-0 h-[calc(100%-8rem)] md:h-full
          z-50 md:z-auto bg-slate-950/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none
          border-l border-white/5 transition-all duration-500 ease-in-out
          w-full sm:w-[380px] md:w-[340px] lg:w-[380px] xl:w-[420px]
          ${isFeedOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          ${!isFeedOpen ? 'md:flex' : 'flex'}
        `}>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsFeedOpen(false)}
            className="md:hidden absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-20 bg-indigo-600 rounded-l-2xl flex items-center justify-center text-white shadow-2xl"
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="flex-1 flex flex-col overflow-hidden glass md:border-0 h-full">
            <SocialFeed posts={vibeData.posts} isLoading={isLoading} />
          </div>
        </aside>
      </main>

      {/* Global Transition Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center px-6"
          >
            <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" size={32} />
            </div>
            <h2 className="text-xl md:text-3xl font-black tracking-tighter mt-10 uppercase text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">Recalibrating Pulse</h2>
            <div className="flex gap-2 mt-4">
                {[1, 2, 3].map(i => (
                    <motion.div 
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-500 rounded-full"
                    />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavIcon: React.FC<{ icon: React.ReactNode; active?: boolean }> = ({ icon, active }) => (
  <button className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:text-white md:hover:bg-white/5'}`}>
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
  </button>
);

const StatCard: React.FC<{ label: string; value: string; warning?: boolean; glow?: boolean }> = ({ label, value, warning, glow }) => (
  <div className={`glass p-2.5 md:p-5 rounded-xl md:rounded-2xl flex-1 backdrop-blur-xl flex flex-col justify-center items-center border transition-all duration-500 ${warning ? 'border-rose-500/50 bg-rose-500/5' : glow ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5'}`}>
    <span className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-black mb-0.5 md:mb-1">{label}</span>
    <span className={`text-xs md:text-xl font-black tracking-tight truncate w-full text-center ${warning ? 'text-rose-400' : glow ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
  </div>
);

export default App;
