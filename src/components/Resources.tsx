import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Video, 
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Resource } from '../types';

interface ResourcesProps {
  user: User;
}

export default function Resources({ user }: ResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];
  
  const filtered = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                         r.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || r.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold text-slate-900">Guidance Resources</h2>
        <p className="text-slate-500">Curated materials for your growth and success</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                category === cat 
                  ? 'bg-brand-600 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={res.id}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  res.type === 'article' ? 'bg-blue-50 text-blue-600' :
                  res.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {res.type === 'article' && <FileText className="w-5 h-5" />}
                  {res.type === 'video' && <Video className="w-5 h-5" />}
                  {res.type === 'link' && <LinkIcon className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded">
                  {res.category}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                {res.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">
                {res.content}
              </p>

              <button className="flex items-center text-brand-600 text-sm font-bold group/btn">
                Read More 
                <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
