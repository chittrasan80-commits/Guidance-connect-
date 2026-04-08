import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Plus,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Appointment } from '../types';

interface DashboardProps {
  user: User;
  setView: (view: any) => void;
}

export default function Dashboard({ user, setView }: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: 'Total Sessions', value: appointments.length, icon: Calendar, color: 'bg-blue-500' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
  ];

  const upcoming = appointments
    .filter(a => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
          Hello, {user.name.split(' ')[0]}!
        </h2>
        <p className="text-slate-500">Here's what's happening with your guidance journey today.</p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Upcoming Sessions</h3>
            <button 
              onClick={() => setView('appointments')}
              className="text-brand-600 text-sm font-bold flex items-center hover:underline"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((apt) => (
                <div key={apt.id} className="flex items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center mr-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-slate-900 leading-none">
                      {new Date(apt.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user.role === 'student' ? apt.counselor_name : apt.student_name}
                    </p>
                    <p className="text-xs text-slate-500">{apt.time}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {apt.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No upcoming appointments</p>
              <button 
                onClick={() => setView('appointments')}
                className="mt-4 inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Session
              </button>
            </div>
          )}
        </section>

        {/* Quick Actions / AI Feature */}
        <section className="space-y-6">
          <div 
            onClick={() => setView('ai')}
            className="group cursor-pointer bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-2xl text-white shadow-lg shadow-brand-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-bold mb-2">AI Career Assistant</h3>
              <p className="text-brand-100 mb-6 max-w-xs">Get personalized career advice and academic guidance powered by Gemini AI.</p>
              <div className="inline-flex items-center font-bold text-sm">
                Try it now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setView('resources')}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <BookOpen className="w-8 h-8 text-brand-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900">Resources</h4>
              <p className="text-xs text-slate-500">Guides & Articles</p>
            </button>
            <button 
              onClick={() => setView('appointments')}
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <Calendar className="w-8 h-8 text-brand-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-slate-900">Schedule</h4>
              <p className="text-xs text-slate-500">Book a Counselor</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
