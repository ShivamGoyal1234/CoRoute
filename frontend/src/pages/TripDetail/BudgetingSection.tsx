import { useRef, useEffect, useState } from 'react';
import type { Trip, TripStats, Activity, Day, Membership } from '../../types';
import { formatPrice, getInitials } from '../../utils/helpers';
import { landingColors } from '../../landing/theme';
import { activitiesApi } from '../../lib/api';

const EXPENSE_CATEGORIES = ['All Expenses', 'Transportation', 'Food & Dining', 'Accommodation', 'Activities'] as const;

const MANUAL_CATEGORIES = ['Food', 'Transportation', 'Accommodation', 'Activities'] as const;

const TRANSPORTATION_BLUE = '#2563EB';
const FOOD_BG = '#FFEDD5';
const FOOD_ICON = '#EA580C';

function getExpenseCategoryStyle(category: string | undefined): { bg: string; iconColor: string; icon: 'train' | 'food' | 'default' } {
  const c = (category ?? '').toLowerCase();
  if (c === 'transportation') return { bg: 'rgba(37, 99, 235, 0.12)', iconColor: TRANSPORTATION_BLUE, icon: 'train' };
  if (c === 'food') return { bg: FOOD_BG, iconColor: FOOD_ICON, icon: 'food' };
  return { bg: 'rgba(139, 92, 246, 0.1)', iconColor: landingColors.primary, icon: 'default' };
}

function getAddedByName(activity: Activity): string {
  const u = activity.userId;
  if (u && typeof u === 'object' && 'name' in u && u.name) return u.name;
  return 'A member';
}

function downloadExpensesCsv(
  expenses: { activity: Activity; dayNumber: number }[],
  filename = 'expenses.csv'
) {
  const headers = ['Day', 'Activity', 'Category', 'Cost', 'Added By'];
  const csvRows = [
    headers.join(','),
    ...expenses.map(({ activity, dayNumber }) => {
      const row = [
        `"Day ${dayNumber}"`,
        `"${(activity.title || '').replace(/"/g, '""')}"`,
        `"${(activity.description || '').replace(/"/g, '""')}"`,
        activity.cost ?? 0,
        `"${getAddedByName(activity).replace(/"/g, '""')}"`,
      ];
      return row.join(',');
    }),
  ];
  const csvContent = csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ExpenseCategoryIcon({ category, className }: { category: string | undefined; className?: string }) {
  const { iconColor, icon } = getExpenseCategoryStyle(category);
  const style = { color: iconColor };
  if (icon === 'train') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 16h16M4 16V8a2 2 0 012-2h2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v2h2a2 2 0 012 2v8M8 6h8" />
      </svg>
    );
  }
  if (icon === 'food') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v12c0 1.1.9 2 2 2s2-.9 2-2V2M8 6v10M16 6v10" />
      </svg>
    );
  }
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

interface BudgetingSectionProps {
  trip: Trip;
  stats: TripStats | null;
  canEdit: boolean;
  onEditBudget: () => void;
  newExpenseFormOpen?: boolean;
  onConsumeNewExpenseOpen?: () => void;
  activitiesByDay: Record<string, Activity[]>;
  days: Day[];
  members?: Membership[];
  onManualExpenseAdded?: () => Promise<void>;
}

export function BudgetingSection({
  trip,
  stats,
  canEdit,
  onEditBudget,
  newExpenseFormOpen,
  onConsumeNewExpenseOpen,
  activitiesByDay,
  days,
  members = [],
  onManualExpenseAdded,
}: BudgetingSectionProps) {
  const manualEntryRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState<string>('All Expenses');
  const [manualDescription, setManualDescription] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCategory, setManualCategory] = useState<string>('Food');
  const [selectedPayerId, setSelectedPayerId] = useState<string | null>(
    () => members[0]?._id ?? null
  );
  useEffect(() => {
    if (members.length > 0 && (!selectedPayerId || !members.some((m) => m._id === selectedPayerId))) {
      setSelectedPayerId(members[0]._id);
    }
  }, [members, selectedPayerId]);
  const totalBudget = trip.totalBudget ?? 0;
  const spent = stats?.totalExpenses ?? 0;
  const remaining = totalBudget - spent;
  const spentPercent = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
  const projectedSurplus = remaining > 200 ? 200 : remaining > 0 ? remaining : 0;

  useEffect(() => {
    if (newExpenseFormOpen && manualEntryRef.current && onConsumeNewExpenseOpen) {
      manualEntryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onConsumeNewExpenseOpen();
    }
  }, [newExpenseFormOpen, onConsumeNewExpenseOpen]);

  const expenseItems: { activity: Activity; dayNumber: number }[] = [];
  days.forEach((day) => {
    const activities = activitiesByDay[day._id] ?? [];
    activities.forEach((a) => {
      if (a.cost != null && a.cost > 0) {
        expenseItems.push({ activity: a, dayNumber: day.dayNumber });
      }
    });
  });
  expenseItems.sort((a, b) => (b.activity.updatedAt ?? '').localeCompare(a.activity.updatedAt ?? ''));

  const activityMatchesFilter = (activity: Activity, filter: string): boolean => {
    if (filter === 'All Expenses') return true;
    const desc = (activity.description ?? '').trim().toLowerCase();
    if (filter === 'Transportation') return desc === 'transportation';
    if (filter === 'Food & Dining') return desc === 'food' || desc === 'food & dining';
    if (filter === 'Accommodation') return desc === 'accommodation';
    if (filter === 'Activities') return desc === 'activities';
    return true;
  };
  const filteredExpenseItems = category === 'All Expenses'
    ? expenseItems
    : expenseItems.filter(({ activity }) => activityMatchesFilter(activity, category));
  const recentExpenses = filteredExpenseItems.slice(0, 10);

  // Reference estimate per expense: 10% of total budget. If an expense exceeds this, show "+ X% Over Exp." in orange.
  const referenceEstPerExpense = totalBudget > 0 ? totalBudget / 10 : 0;
  const getExpenseStatus = (cost: number) => {
    if (referenceEstPerExpense <= 0 || cost <= referenceEstPerExpense) return { type: 'ok' as const, text: 'Stayed in budget' };
    const overPercent = Math.round(((cost - referenceEstPerExpense) / referenceEstPerExpense) * 100);
    return { type: 'over' as const, text: `+${overPercent}% Over Exp.` };
  };

  const [addExpenseSubmitting, setAddExpenseSubmitting] = useState(false);
  const [addExpenseError, setAddExpenseError] = useState<string | null>(null);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddExpenseError(null);
    const firstDay = days[0];
    if (!firstDay) {
      setAddExpenseError('Trip has no days yet. Add a day in Itinerary first.');
      return;
    }
    const amount = parseFloat(manualAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setAddExpenseError('Please enter a valid amount.');
      return;
    }
    const title = manualDescription.trim() || 'Manual expense';
    setAddExpenseSubmitting(true);
    try {
      await activitiesApi.create({
        dayId: firstDay._id,
        title,
        description: manualCategory,
        cost: amount,
      });
      setManualDescription('');
      setManualAmount('');
      if (onManualExpenseAdded) await onManualExpenseAdded();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to add expense';
      setAddExpenseError(msg);
    } finally {
      setAddExpenseSubmitting(false);
    }
  };

  const cardStyle = 'rounded-xl border p-5 bg-white flex flex-col gap-1 shadow-sm relative';
  const borderStyle = { borderColor: 'rgba(226, 232, 240, 0.8)' };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-6 py-6 w-full" style={{ backgroundColor: '#F6F5F8' }}>
      <div className="max-w-6xl">
        <div className="flex items-center gap-4 mb-1">
          <h1 className="text-4xl font-bold" style={{ color: landingColors.text }}>
            Trip Budget & Expense Tracker
          </h1>
          {canEdit && (
            <button
              type="button"
              onClick={onEditBudget}
              className="px-3 py-1.5 rounded-xl font-medium text-white transition-opacity hover:opacity-95 flex items-center gap-1.5 text-xs shadow-sm"
              style={{
                backgroundColor: landingColors.primary,
                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)',
              }}
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Edit Budget
            </button>
          )}
        </div>
        <p className="text-sm mb-6" style={{ color: landingColors.textMuted }}>
          Real-time collaboration for {trip.title}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={cardStyle} style={borderStyle}>
            <div className="absolute top-4 right-4 text-slate-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: landingColors.textMuted }}>
              Total Budget
            </span>
            <span className="text-xl font-bold" style={{ color: landingColors.text }}>
              {formatPrice(totalBudget, trip.baseCurrency)}
            </span>
            <span className="text-xs" style={{ color: landingColors.textMuted }}>
              Shared among {trip.travelerCount ?? 1} members
            </span>
          </div>
          <div
            className={cardStyle}
            style={{
              ...borderStyle,
              ...(spentPercent >= 80 ? { borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.06)' } : {}),
            }}
          >
            <div className="absolute top-4 right-4 text-amber-500" style={spentPercent >= 80 ? { color: '#DC2626' } : undefined}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 0111.814-2.086l-3.33 3.33h.008v.008l-3.33-3.33a11.95 11.95 0 01-2.086 11.814L12.75 15l-6.75 6.75" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: landingColors.textMuted }}>
              Spent
            </span>
            <span className="text-xl font-bold" style={{ color: landingColors.text }}>
              {formatPrice(spent, trip.baseCurrency)}
            </span>
            {spentPercent >= 80 ? (
              <span className="inline-flex items-center gap-1.5 text-xs mt-1">
                <span className="px-2 py-0.5 rounded-full font-medium text-white bg-red-600">
                  DANGER
                </span>
                <span style={{ color: landingColors.textMuted }}>{spentPercent}% of total budget</span>
              </span>
            ) : spentPercent >= 48 ? (
              <span className="inline-flex items-center gap-1.5 text-xs mt-1">
                <span className="px-2 py-0.5 rounded-full font-medium text-white bg-amber-500">WARNING</span>
                <span style={{ color: landingColors.textMuted }}>{spentPercent}% of total budget</span>
              </span>
            ) : spentPercent > 0 ? (
              <span className="text-xs" style={{ color: landingColors.textMuted }}>{spentPercent}% of total budget</span>
            ) : null}
          </div>
          <div className={cardStyle} style={borderStyle}>
            <div className="absolute top-4 right-4 text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: landingColors.textMuted }}>
              Remaining
            </span>
            <span className="text-xl font-bold" style={{ color: landingColors.text }}>
              {formatPrice(remaining, trip.baseCurrency)}
            </span>
            {remaining > 0 && (
              <span className="inline-flex flex-wrap items-center gap-1.5 text-xs mt-1">
                <span className="px-2 py-0.5 rounded-full font-medium text-white bg-emerald-500">UNDER BUDGET</span>
                <span style={{ color: landingColors.textMuted }}>
                  {projectedSurplus > 0 ? `Projected surplus: ${formatPrice(projectedSurplus, trip.baseCurrency)}` : 'On track'}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-4">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="px-4 py-2 rounded-2xl text-sm font-medium transition-colors bg-white border"
                  style={{
                    backgroundColor: category === cat ? landingColors.primary : '#fff',
                    color: category === cat ? '#fff' : landingColors.textMuted,
                    borderColor: category === cat ? landingColors.primary : 'rgba(226, 232, 240, 0.8)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="rounded-xl border overflow-hidden bg-white shadow-sm" style={borderStyle}>
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
              >
                <h2 className="font-semibold text-lg" style={{ color: landingColors.text }}>
                  Recent Expenses
                </h2>
                <button
                  type="button"
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: landingColors.primary }}
                  onClick={() => downloadExpensesCsv(recentExpenses)}
                >
                  Download CSV
                </button>
              </div>
              <ul
                className={`divide-y ${recentExpenses.length > 5 ? 'overflow-y-auto max-h-[320px]' : ''}`}
                style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
              >
                {recentExpenses.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm" style={{ color: landingColors.textMuted }}>
                    No expenses yet. Add costs to itinerary activities or use Manual Entry.
                  </li>
                ) : (
                  recentExpenses.map(({ activity, dayNumber }) => {
                    const categoryStyle = getExpenseCategoryStyle(activity.description);
                    return (
                    <li
                      key={activity._id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                      style={{ borderBottom: '1px solid #D1D5DB' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: categoryStyle.bg }}
                        >
                          <ExpenseCategoryIcon category={activity.description} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: landingColors.text }}>
                            {activity.title}
                          </p>
                          <p className="text-xs truncate" style={{ color: landingColors.textMuted }}>
                            Day {dayNumber} • Added by {getAddedByName(activity)}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold" style={{ color: landingColors.text }}>
                          {formatPrice(activity.cost ?? 0, trip.baseCurrency)}
                        </p>
                        {(() => {
                          const status = getExpenseStatus(activity.cost ?? 0);
                          return status.type === 'over' ? (
                            <p className="text-xs font-medium" style={{ color: '#F6A41A' }}>
                              {status.text}
                            </p>
                          ) : (
                            <p className="text-xs text-emerald-600">{status.text}</p>
                          );
                        })()}
                      </div>
                    </li>
                    );
                  })
                )}
              </ul>
              {recentExpenses.length > 0 && (
                <div className="px-4 py-2 border-t text-center shrink-0" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
                  <button type="button" className="text-sm font-medium cursor-pointer hover:underline" style={{ color: landingColors.primary }}>
                    View all transaction history
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div
              ref={manualEntryRef}
              className="rounded-xl border bg-white shadow-sm flex flex-col max-h-[calc(100vh-14rem)] min-h-0"
              style={borderStyle}
            >
              <div className="flex items-center gap-2 p-5 pb-0 shrink-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
                  <svg className="w-5 h-5" style={{ color: landingColors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="font-bold text-base" style={{ color: landingColors.text }}>
                  Manual Entry
                </h2>
              </div>
              <div className="p-5 pt-4 overflow-y-auto min-h-0 flex-1">
              {canEdit && (
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: landingColors.textMuted }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={manualDescription}
                      onChange={(e) => setManualDescription(e.target.value)}
                      placeholder="e.g. Dinner at Tokyo Tower"
                      className="w-full px-3 py-2.5 rounded-lg border text-sm bg-slate-50/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ borderColor: 'rgba(226, 232, 240, 0.9)', color: landingColors.text, ['--tw-ring-color' as string]: landingColors.primary }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: landingColors.textMuted }}>
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 rounded-lg border text-sm bg-slate-50/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
                        style={{ borderColor: 'rgba(226, 232, 240, 0.9)', color: landingColors.text, ['--tw-ring-color' as string]: landingColors.primary }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: landingColors.textMuted }}>
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={manualCategory}
                          onChange={(e) => setManualCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border text-sm bg-slate-50/80 appearance-none focus:outline-none focus:ring-2 focus:ring-offset-0 pr-9"
                          style={{ borderColor: 'rgba(226, 232, 240, 0.9)', color: landingColors.text, ['--tw-ring-color' as string]: landingColors.primary }}
                        >
                          {MANUAL_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center" aria-hidden>
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: landingColors.textMuted }}>
                      Payer
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {members.slice(0, 4).map((m) => {
                        const u = typeof m.userId === 'object' ? m.userId : null;
                        const name = u?.name ?? '?';
                        const isSelected = selectedPayerId === m._id;
                        return (
                          <button
                            key={m._id}
                            type="button"
                            onClick={() => setSelectedPayerId(m._id)}
                            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden flex-shrink-0 transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              border: isSelected ? `3px solid ${landingColors.primary}` : '2px solid rgba(226, 232, 240, 0.9)',
                              backgroundColor: '#fff',
                              ['--tw-ring-color' as string]: landingColors.primary,
                            }}
                            title={name}
                          >
                            {u?.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span style={{ color: landingColors.primary }}>{getInitials(name)}</span>
                            )}
                          </button>
                        );
                      })}
                      {members.length === 0 && (
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 border-2 border-dashed" style={{ borderColor: 'rgba(226, 232, 240, 0.9)' }}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {addExpenseError && (
                    <p className="text-sm text-red-600" role="alert">
                      {addExpenseError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={addExpenseSubmitting}
                    className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity disabled:opacity-60 disabled:pointer-events-none"
                    style={{ backgroundColor: landingColors.primary, boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.35)' }}
                  >
                    {addExpenseSubmitting ? (
                      'Adding…'
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Add Expense
                      </>
                    )}
                  </button>
                </form>
              )}
              <div
                className="mt-4 pt-4 p-4 rounded-lg"
                style={{ borderColor: 'rgba(251, 191, 36, 0.4)' }}
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="text-sm min-w-0">
                    <p className="font-bold text-amber-900">Smart Alert</p>
                    <p className="font-medium text-amber-900 mt-1">
                      {spentPercent >= 80 ? (
                        <>You are currently <span className="text-red-600 font-semibold">{spentPercent}%</span> of budget. Consider allocating less to optional spending.</>
                      ) : spentPercent >= 50 ? (
                        <>You are currently <span className="text-emerald-600 font-semibold">{spentPercent}%</span> of budget. Consider allocating funds carefully.</>
                      ) : (
                        <>You are currently <span className="text-emerald-600 font-semibold">{spentPercent}%</span>. Consider setting aside a small surplus for surprises.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}
