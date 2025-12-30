
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '../types';

interface SocialFeedProps {
  posts: Post[];
  isLoading: boolean;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ posts, isLoading }) => {
  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto p-4 custom-scrollbar">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">Live Intelligence</h2>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <AnimatePresence mode="popLayout">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="glass p-4 rounded-xl animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-2 bg-white/10 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-5/6" />
              </div>
            </div>
          ))
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass p-4 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="flex gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
                  {post.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate">{post.author}</h3>
                    <MoreHorizontal size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-slate-400 truncate">@{post.handle}</p>
                </div>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                {post.content}
              </p>
              <div className="flex items-center justify-between text-slate-500">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer">
                    <MessageSquare size={14} /> <span className="text-[10px]">24</span>
                  </span>
                  <span className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer">
                    <Heart size={14} /> <span className="text-[10px]">1.2k</span>
                  </span>
                  <span className="flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer">
                    <Share2 size={14} />
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-tighter">{post.timestamp}</span>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialFeed;
