import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tripsApi, membersApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { MemberRole } from '../types';
import { landingColors } from '../landing/theme';
import { getInitials } from '../utils/helpers';

const TRIP_DRAFT_KEY = 'coroute_trip_draft';
const STEPS = ['Basics', 'Budget', 'Invite'];

interface PendingInvite {
  email: string;
  role: MemberRole;
}

const DEFAULT_BUDGET_CATEGORIES = [
  { key: 'accommodation', label: 'Accommodation', description: 'Hotels, rentals, hostels', icon: 'bed' },
  { key: 'food', label: 'Food & Dining', description: 'Meals, drinks, snacks', icon: 'food' },
  { key: 'transportation', label: 'Transportation', description: 'Flights, cabs, fuel', icon: 'car' },
  { key: 'activities', label: 'Activities', description: 'Tours, entry fees, fun', icon: 'ticket' },
] as const;

interface BudgetCategory {
  id: string;
  key?: string;
  label: string;
  description: string;
  amount: string;
}

export default function NewTrip() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [totalBudget, setTotalBudget] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() =>
    DEFAULT_BUDGET_CATEGORIES.map((c) => ({ id: c.key, key: c.key, label: c.label, description: c.description, amount: '' }))
  );
  const [budgetVisibleToAll, setBudgetVisibleToAll] = useState(true);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [joinSecret, setJoinSecret] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('editor');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [members, setMembers] = useState<Array<{ _id: string; userId: { _id: string; name: string; email: string; avatarUrl?: string }; role: string; joinedAt: string }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(TRIP_DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        title?: string;
        destination?: string;
        startDate?: string;
        endDate?: string;
        baseCurrency?: string;
        totalBudget?: string;
        step?: number;
        budgetCategories?: BudgetCategory[];
        budgetVisibleToAll?: boolean;
        invites?: PendingInvite[];
      };
      if (draft.title) setTitle(draft.title);
      if (draft.destination) setDestination(draft.destination ?? '');
      if (draft.startDate) setStartDate(draft.startDate);
      if (draft.endDate) setEndDate(draft.endDate);
      if (draft.baseCurrency) setBaseCurrency(draft.baseCurrency ?? 'USD');
      if (draft.totalBudget) setTotalBudget(draft.totalBudget ?? '');
      if (draft.step && draft.step >= 1 && draft.step <= 3) setCurrentStep(draft.step as 1 | 2 | 3);
      if (draft.budgetCategories?.length) setBudgetCategories(draft.budgetCategories);
      if (draft.budgetVisibleToAll !== undefined) setBudgetVisibleToAll(draft.budgetVisibleToAll);
      if (draft.invites?.length) setPendingInvites(draft.invites);
      sessionStorage.removeItem(TRIP_DRAFT_KEY);
    } catch (_) { }
  }, []);

  const saveDraft = () => {
    try {
      sessionStorage.setItem(
        TRIP_DRAFT_KEY,
        JSON.stringify({
          title,
          destination,
          startDate,
          endDate,
          baseCurrency,
          totalBudget,
          step: currentStep,
          budgetCategories,
          budgetVisibleToAll,
          invites: pendingInvites,
        })
      );
    } catch (_) { }
    navigate('/dashboard');
  };

  const totalFromCategories = useMemo(() => {
    return budgetCategories.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  }, [budgetCategories]);

  const setCategoryAmount = (id: string, amount: string) => {
    setBudgetCategories((prev) => prev.map((c) => (c.id === id ? { ...c, amount } : c)));
  };

  const addCustomCategory = () => {
    setBudgetCategories((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, label: 'Custom', description: '', amount: '' },
    ]);
  };

  const removeCustomCategory = (id: string) => {
    setBudgetCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const goNext = async () => {
    setError('');
    if (currentStep === 1) {
      if (!startDate || !endDate) {
        setError('Please set start and end dates.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (createdTripId) {
        setCurrentStep(3);
        return;
      }
      setLoading(true);
      try {
        const { data } = await tripsApi.create({
          title: title || 'Untitled Adventure',
          startDate,
          endDate,
          baseCurrency,
          totalBudget: totalFromCategories > 0 ? totalFromCategories : (totalBudget ? Number(totalBudget) : undefined),
          budgetCategories: budgetCategories.map((c) => ({
            key: c.key,
            label: c.label,
            description: c.description || undefined,
            amount: Number(c.amount) || 0,
          })),
        });
        setCreatedTripId(data.trip._id);
        setJoinSecret(data.trip.joinSecret ?? null);
        setCurrentStep(3);
      } catch (err: any) {
        setError(err.response?.data?.error ?? err.response?.data?.errors?.[0]?.msg ?? 'Failed to create trip');
      } finally {
        setLoading(false);
      }
    }
  };

  const goBack = () => {
    setError('');
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  };

  useEffect(() => {
    if (currentStep !== 3 || !createdTripId) return;
    let cancelled = false;
    setMembersLoading(true);
    membersApi
      .list(createdTripId)
      .then(({ data }) => {
        if (!cancelled) setMembers(data.members as any);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentStep, createdTripId]);

  const inviteByEmail = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !createdTripId) return;
    setError('');
    setInviteLoading(true);
    try {
      await membersApi.invite(createdTripId, email, inviteRole);
      setInviteEmail('');
      const { data } = await membersApi.list(createdTripId);
      setMembers(data.members as any);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to invite. User may not be registered.');
    } finally {
      setInviteLoading(false);
    }
  };

  const removeMember = async (membershipId: string) => {
    if (!createdTripId) return;
    try {
      await membersApi.remove(membershipId);
      const { data } = await membersApi.list(createdTripId);
      setMembers(data.members as any);
    } catch (_) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      goNext();
      return;
    }
  };

  const joinLink = createdTripId && joinSecret
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${createdTripId}/${joinSecret}`
    : '';

  const copyJoinLink = () => {
    if (!joinLink) return;
    navigator.clipboard.writeText(joinLink);
  };

  const progressPercent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;
  const step = currentStep;

  const inputBase =
    'w-full px-4 py-2.5 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2';
  const inputStyle = {
    borderColor: 'rgba(226, 232, 240, 0.9)',
    color: landingColors.text,
  };
  return (
    <div
      className="min-h-full flex items-center justify-center p-6"
      style={{ backgroundColor: landingColors.background }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div
          className="rounded-2xl border shadow-sm overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: 'rgba(226, 232, 240, 0.9)',
          }}
        >
          <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(226, 232, 240, 0.9)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: landingColors.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {step === 1 && 'Create New Trip'}
                  {step === 2 && 'Set Your Trip Budget'}
                  {step === 3 && 'Invite Your Squad'}
                </h1>
                {step === 2 && (
                  <p className="text-sm mt-1" style={{ color: landingColors.textMuted }}>
                    Estimate your spending to keep the group on track.
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider shrink-0" style={{ color: landingColors.secondary }}>
                {step === 2 ? 'STEP 2 OF 3 Budget Setup' : `STEP ${step} OF 3`}
              </span>
            </div>
            <div className="mt-3 w-full">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold" style={{ color: landingColors.primary }}>
                  PROGRESS: {Math.round(progressPercent)}%
                </span>
                <span className="text-xs font-medium">
                  {STEPS.map((s, i) => (
                    <span key={s}>
                      {i > 0 && <span style={{ color: landingColors.textMuted }}> → </span>}
                      <span style={{ color: i + 1 === step ? landingColors.primary : landingColors.textMuted, fontWeight: i + 1 === step ? 600 : 400 }}>
                        {s}
                      </span>
                    </span>
                  ))}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(226, 232, 240, 0.8)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, backgroundColor: landingColors.primary }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-6 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
                {error}
              </div>
            )}

            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <>
            <section className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: landingColors.text }}>
                Trip Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputBase}
                style={inputStyle}
                placeholder="Untitled Adventure"
              />
            </section>

            <section className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: landingColors.text }}>
                Where are you going?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={`${inputBase} pl-9`}
                  style={inputStyle}
                  placeholder="Search cities, countries or regions"
                />
              </div>
            </section>

            <section className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: landingColors.text }}>
                    Start Date
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className={`${inputBase} pl-9`}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: landingColors.text }}>
                    End Date
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className={`${inputBase} pl-9`}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </section>
              </>
            )}

            {/* Step 2: Budget */}
            {currentStep === 2 && (
              <>
                <section className="mb-6 p-4 rounded-xl grid grid-cols-2 gap-4" style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: landingColors.text }}>
                      Currency
                    </label>
                    <select
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value)}
                      className={inputBase}
                      style={inputStyle}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: landingColors.text }}>
                      Total Estimated Budget
                    </label>
                    <div className={`${inputBase} flex items-center`} style={{ ...inputStyle, cursor: 'default' }}>
                      <span className="text-slate-500 mr-1">{baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : baseCurrency === 'GBP' ? '£' : '₹'}</span>
                      <span>{totalFromCategories.toFixed(2)}</span>
                    </div>
                  </div>
                </section>
                <section className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: landingColors.primary }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </span>
                    <h2 className="text-sm font-medium" style={{ color: landingColors.text }}>
                      Define Budget Categories
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {budgetCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-4 rounded-xl border flex flex-wrap items-center gap-4"
                        style={{ borderColor: 'rgba(226, 232, 240, 0.9)', backgroundColor: '#fff' }}
                      >
                        <div className="flex-1 min-w-[140px]">
                          <p className="text-sm font-medium" style={{ color: landingColors.text }}>{cat.label}</p>
                          {cat.description ? <p className="text-xs mt-0.5" style={{ color: landingColors.textMuted }}>{cat.description}</p> : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: landingColors.textMuted }}>
                            {baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : baseCurrency === 'GBP' ? '£' : '₹'}
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={cat.amount}
                            onChange={(e) => setCategoryAmount(cat.id, e.target.value)}
                            className={`${inputBase} w-24`}
                            style={inputStyle}
                            placeholder="0"
                          />
                        </div>
                        {!cat.key && (
                          <button
                            type="button"
                            onClick={() => removeCustomCategory(cat.id)}
                            className="text-sm px-2 py-1 rounded hover:bg-slate-100"
                            style={{ color: landingColors.textMuted }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addCustomCategory}
                    className="mt-3 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ color: landingColors.primary }}
                  >
                    + Add Custom Category
                  </button>
                </section>
                <section className="mb-6 p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: landingColors.text }}>
                      Allow all travelers to see budget summary
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: landingColors.textMuted }}>
                      If off, only the trip creator can view these estimates.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={budgetVisibleToAll}
                    onClick={() => setBudgetVisibleToAll((v) => !v)}
                    className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                    style={{ backgroundColor: budgetVisibleToAll ? landingColors.primary : 'rgba(226, 232, 240, 0.9)' }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                      style={{ left: budgetVisibleToAll ? '22px' : '4px' }}
                    />
                  </button>
                </section>
              </>
            )}

            {/* Step 3: Invite Your Squad */}
            {currentStep === 3 && createdTripId && (
              <>
                <section className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: landingColors.primary }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.172-1.171a4 4 0 003.312-1.195" />
                      </svg>
                    </span>
                    <h2 className="text-sm font-medium" style={{ color: landingColors.text }}>
                      Share Secret Link
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={joinLink}
                      className={`${inputBase} flex-1 min-w-0`}
                      style={{ ...inputStyle, backgroundColor: 'rgba(248, 250, 252, 0.9)' }}
                    />
                    <button
                      type="button"
                      onClick={copyJoinLink}
                      className="px-4 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 flex items-center gap-2 shrink-0"
                      style={{ backgroundColor: landingColors.primary }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m0 10v2a2 2 0 002 2h2m0-10V6m0 10h2a2 2 0 002-2v-2" />
                      </svg>
                      Copy Link
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: landingColors.textMuted }}>
                    Anyone with this link can view and request to join your trip.
                  </p>
                </section>

                <section className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ color: landingColors.primary }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <h2 className="text-sm font-medium" style={{ color: landingColors.text }}>
                      Invite via Email
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), inviteByEmail())}
                        className={`${inputBase} pl-9`}
                        style={inputStyle}
                        placeholder="friend@example.com"
                      />
                    </div>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                      className={`${inputBase} w-28 shrink-0`}
                      style={inputStyle}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={inviteByEmail}
                      disabled={inviteLoading}
                      className="px-5 py-2.5 rounded-xl font-medium transition-opacity hover:opacity-95 shrink-0 border"
                      style={{ backgroundColor: '#fff', color: landingColors.primary, borderColor: 'rgba(226, 232, 240, 0.9)' }}
                    >
                      {inviteLoading ? 'Inviting…' : 'Invite'}
                    </button>
                  </div>
                </section>

                <section className="mb-6">
                  <h2 className="text-sm font-medium mb-3" style={{ color: landingColors.text }}>
                    Members {members.length > 0 ? members.length : ''}
                  </h2>
                  {membersLoading ? (
                    <p className="text-sm" style={{ color: landingColors.textMuted }}>Loading members…</p>
                  ) : (
                    <ul className="space-y-2">
                      {members.map((m) => {
                        const u = m.userId as any;
                        const isOwner = m.role === 'owner';
                        const isYou = currentUser && String(u?._id ?? u?.id) === currentUser.id;
                        return (
                          <li
                            key={m._id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl border"
                            style={{ borderColor: 'rgba(226, 232, 240, 0.9)', backgroundColor: '#fff' }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {u?.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                              ) : (
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                                  style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', color: landingColors.primaryHeader }}
                                >
                                  {getInitials(u?.name ?? u?.email ?? '?')}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: landingColors.text }}>
                                  {isYou ? `You (${u?.name ?? currentUser?.name ?? 'Owner'})` : (u?.name ?? u?.email ?? '—')}
                                </p>
                                <p className="text-xs truncate" style={{ color: landingColors.textMuted }}>
                                  {u?.email ?? ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(236, 229, 249, 0.6)', color: landingColors.primaryHeader }}>
                                {m.role}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded" style={{ color: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.1)' }}>
                                ACTIVE
                              </span>
                              {!isOwner && (
                                <button
                                  type="button"
                                  onClick={() => removeMember(m._id)}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                                  aria-label="Remove member"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </>
            )}

            <div className="flex items-center justify-between pt-6 mt-2 border-t" style={{ borderColor: 'rgba(226, 232, 240, 0.9)' }}>
              {currentStep === 1 ? (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ color: landingColors.primary }}
                >
                  ← Back to Dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ color: landingColors.primary }}
                >
                  ← Back
                </button>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="px-4 py-2.5 rounded-xl font-medium transition-colors"
                  style={{ backgroundColor: 'rgba(241, 245, 249, 0.9)', color: landingColors.textMuted }}
                >
                  Save Draft
                </button>
                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95"
                    style={{ backgroundColor: landingColors.primary, boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)' }}
                  >
                    Create Trip
                  </button>
                )}
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: landingColors.primary, boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)' }}
                  >
                    {loading ? 'Creating…' : 'Next: Invite Travelers'}
                    {!loading && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    )}
                  </button>
                )}
                {currentStep === 3 && (
                  <button
                    type="button"
                    onClick={() => createdTripId && navigate(`/trips/${createdTripId}`, { replace: true })}
                    className="px-5 py-2.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 flex items-center gap-2"
                    style={{ backgroundColor: landingColors.primary, boxShadow: '0 8px 24px 0 rgba(139, 92, 246, 0.3)' }}
                  >
                    Finish & Start Planning
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
