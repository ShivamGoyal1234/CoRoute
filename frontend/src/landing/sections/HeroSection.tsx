import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroMap } from '../../components/HeroMap';
import { useSkipAnimation } from '../../contexts/SkipAnimationContext';
import type { useLandingColors } from '../theme';
import { howItWorksSteps } from '../data';

const TRIP_DRAFT_KEY = 'coroute_trip_draft';

const stepsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.4,
    },
  },
};

const stepItemVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
      mass: 0.8,
    },
  },
};

const stepCircleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.06,
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

export function HeroSection({ colors }: { colors: ReturnType<typeof useLandingColors> }) {
  const navigate = useNavigate();
  const skip = useSkipAnimation();
  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [routeOption, setRouteOption] = useState<'fastest' | 'shortest' | 'scenic'>('fastest');
  const [details, setDetails] = useState('');

  const saveDraft = () => {
    const draft = {
      title: destination || 'My Trip',
      startDate,
      endDate: tripType === 'round-trip' ? endDate : startDate,
      routeOption,
      details,
    };
    try {
      sessionStorage.setItem(TRIP_DRAFT_KEY, JSON.stringify(draft));
    } catch (_) {}
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDraft();
    navigate('/trips/new');
  };

  const handleSaveDraft = () => {
    saveDraft();
    navigate('/register');
  };

  return (
    <section className="w-full" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={skip ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center mb-3"
          >
            <span
              className="inline-block h-0.5 w-14 mr-4"
              style={{ backgroundColor: colors.primary, minWidth: '3.5rem' }}
              aria-hidden="true"
            />
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: colors.primary, letterSpacing: '0.2em' }}
            >
              SHARED PATHS, SEAMLESS PLANS
            </span>
          </motion.div>
          <motion.div
            initial={skip ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-start p-0 mb-6 shrink-0 grow-0 w-full max-w-[536px] min-h-[120px]"
            style={{ color: colors.text }}
          >
            <h1
              className="text-4xl md:text-5xl font-bold tracking-tight leading-tight m-0"
              style={{ color: colors.text, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: '1.1' }}
            >
              Plan Trips Together, <span style={{ color: colors.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Seamlessly</span>
            </h1>
          </motion.div>
          <motion.p
            initial={skip ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg mb-8 max-w-lg"
            style={{ color: colors.textMuted }}
          >
            The ultimate collaborative platform for modern travelers. Real-time editing, group budgeting, and shared checklists in one beautiful space.
          </motion.p>
          <motion.div
            initial={skip ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-extrabold text-white transition-opacity hover:opacity-95"
              style={{
                backgroundColor: colors.primary,
                boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3), 0 6px 24px -4px rgba(0,0,0,0.10)',
              }}
            >
              Create Your First Trip
            </Link>
            <a
              href="#features"
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold border transition-colors gap-2"
              style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
                style={{
                  color: colors.primary,
                  minWidth: '22px',
                  minHeight: '22px',
                  marginRight: '0.375rem'
                }}
                aria-hidden="true"
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Watch Demo
            </a>
          </motion.div>
          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2">
              {[
                'https://randomuser.me/api/portraits/women/75.jpg',
                'https://randomuser.me/api/portraits/men/42.jpg',
                'https://randomuser.me/api/portraits/men/77.jpg',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="User avatar"
                  className="w-9 h-9 rounded-full border-2 shadow-sm object-cover"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                />
              ))}
            </div>
            <motion.p initial={skip ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm" style={{ color: colors.textMuted }}>
              Join 10k+ groups planning right now
            </motion.p>
          </div>
        </div>
        <motion.div
          initial={skip ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative flex justify-center md:justify-end"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            whileHover={{ rotateY: -2, rotateX: 2 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl overflow-hidden shadow-2xl border w-full max-w-[680px] aspect-[3/2] min-h-[320px] flex flex-col"
            style={{ borderColor: colors.border, backgroundColor: colors.surface, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)' }}
          >
            <div className="flex items-center gap-3 px-3 py-2 border-b shrink-0" style={{ borderColor: colors.border, backgroundColor: colors.headerBg }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-xs text-slate-400 font-normal" style={{ color: colors.textMuted }}>
                  coroute.app/tokyo-adventure-2024
                </span>
              </div>
              <div className="w-12" />
            </div>
            <div className="flex-1 flex flex-col min-h-0 p-2.5 gap-0 bg-gradient-to-br from-teal-500 via-teal-500 to-emerald-600">
              <div className="flex-1 rounded-lg overflow-hidden flex min-h-0 shadow-inner border border-white/30 flex-col sm:flex-row">
                <form onSubmit={handlePlanSubmit} className="w-full sm:w-[52%] sm:min-w-[220px] sm:max-w-[320px] shrink-0 flex flex-col p-3 border-b sm:border-b-0 sm:border-r overflow-y-auto" style={{ borderColor: colors.border, background: `linear-gradient(to bottom, ${colors.headerBg}90, ${colors.surface})` }}>
                  <h3 className="text-xs font-bold tracking-tight mb-2.5 shrink-0" style={{ color: colors.text }}>Planning</h3>
                  <label className="text-[9px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: colors.textMuted }}>Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Tokyo, Japan"
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200/90 bg-white/80 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all placeholder:text-slate-400 mb-2"
                    style={{ color: colors.text }}
                  />
                  <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100/80 border border-slate-200/80 mb-2">
                    <button
                      type="button"
                      onClick={() => setTripType('one-way')}
                      className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${tripType === 'one-way' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      style={tripType === 'one-way' ? { color: colors.text } : {}}
                    >
                      One way
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('round-trip')}
                      className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${tripType === 'round-trip' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      style={tripType === 'round-trip' ? { color: colors.text } : {}}
                    >
                      Round trip
                    </button>
                  </div>
                  <label className="text-[9px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: colors.textMuted }}>Date / Time</label>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 min-w-0 px-2 py-2 text-xs rounded-lg border border-slate-200/90 bg-white/80 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                      style={{ color: colors.text }}
                    />
                    {tripType === 'round-trip' && (
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="flex-1 min-w-0 px-2 py-2 text-xs rounded-lg border border-slate-200/90 bg-white/80 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                        style={{ color: colors.text }}
                      />
                    )}
                  </div>
                  <label className="text-[9px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: colors.textMuted }}>Route options</label>
                  <select
                    value={routeOption}
                    onChange={(e) => setRouteOption(e.target.value as 'fastest' | 'shortest' | 'scenic')}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200/90 bg-white/80 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all mb-2 appearance-none cursor-pointer bg-[length:10px] bg-[right_0.5rem_center] bg-no-repeat pr-7"
                    style={{ color: colors.text, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}
                  >
                    <option value="fastest">Fastest</option>
                    <option value="shortest">Shortest</option>
                    <option value="scenic">Scenic</option>
                  </select>
                  <label className="text-[9px] font-semibold uppercase tracking-widest mb-1 block" style={{ color: colors.textMuted }}>Details</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Notes..."
                    rows={1}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200/90 bg-white/80 focus:bg-white focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all resize-none placeholder:text-slate-400 mb-2 min-h-[36px]"
                    style={{ color: colors.text }}
                  />
                  <div className="mt-auto flex gap-2 pt-2 shrink-0">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg text-xs font-bold text-white shadow-md shadow-[#8B5CF6]/25 hover:shadow-[#8B5CF6]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Create Trip
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border border-slate-200/90 bg-white/80 hover:bg-slate-50/80 hover:border-slate-300 transition-all duration-200"
                      style={{ color: colors.textMuted }}
                    >
                      Save draft
                    </button>
                  </div>
                </form>
                <div className="flex-1 min-w-0 relative w-full pr-0 overflow-hidden shrink" style={{ minHeight: 160 }}>
                  {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                    <HeroMap />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100" style={{ minHeight: 160 }}>
                      <p className="text-xs text-slate-500 px-4 text-center mb-2">Google Map</p>
                      <p className="text-[10px] text-slate-400 text-center px-4">
                        <code className="bg-slate-200 px-1 rounded">Failed to load the map. Please check.</code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-16 md:pt-16 md:pb-24">
        <motion.h2
          initial={skip ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="text-3xl md:text-4xl font-bold text-center mb-3"
          style={{ color: colors.text }}
        >
          From Logistics to Liftoff
        </motion.h2>
        <motion.p
          initial={skip ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-center max-w-xl mx-auto mb-12 md:mb-16"
          style={{ color: colors.textMuted }}
        >
          Stop burying flight PDFs in group chat history. CoRoute centralizes your collective travel intelligence into a single, collaborative source of truth.
        </motion.p>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative"
          initial={skip ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stepsContainerVariants}
        >
          <div
            className="hidden md:block absolute top-[28px] left-[12.5%] right-[12.5%] h-0.5 -translate-y-1/2 overflow-hidden"
            style={{ backgroundColor: `${colors.primary}30` }}
            aria-hidden
          >
            <motion.div
              initial={skip ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full origin-left"
              style={{ backgroundColor: colors.primary }}
            />
          </div>
          {howItWorksSteps.map((item) => (
            <motion.div
              key={item.step}
              variants={stepItemVariants}
              className="relative flex flex-col items-center text-center"
            >
              <motion.div
                variants={stepCircleVariants}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 z-10"
                style={{ backgroundColor: colors.primary }}
              >
                {item.step}
              </motion.div>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>{item.title}</h3>
              <p className="text-sm max-w-[260px] mx-auto leading-relaxed" style={{ color: colors.textMuted }}>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
