import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Users, Lightbulb, Info } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAppContext } from '../state/AppContext';
import { GlassCard } from '../components/GlassCard';
import { formatINR } from '../lib/currency';
import { calcLineCost } from '../lib/cost';
import { SHORT_MONTH_NAMES, DAY_NAMES_FULL } from '../lib/dates';
import { getFutureOccurrences } from '../lib/recurrence';
import type { CateringEvent } from '../types';

const CHART_COLORS = ['#8b5cf6','#ec4899','#6366f1','#f59e0b','#10b981','#06b6d4','#f97316'];

function KpiCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string; sub?: string;
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-violet-400 flex-shrink-0" />
        <span className="text-xs text-white/50 font-medium">{label}</span>
      </div>
      <div className="font-display font-bold text-xl text-white break-words">{value}</div>
      {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}

export function AnalysisPage() {
  const { state } = useAppContext();

  const foodMap = useMemo(
    () => new Map(state.foodItems.map(fi => [fi.id, fi])),
    [state.foodItems]
  );

  function eventRevenue(ev: CateringEvent): number {
    return ev.items.reduce((sum, ei) => {
      const fi = foodMap.get(ei.foodItemId);
      if (!fi) return sum;
      return sum + calcLineCost(fi.pricePerUnit, fi.defaultQuantity, ei.quantity);
    }, 0);
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear  = today.getFullYear();

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalRevenue = useMemo(
    () => state.events.reduce((s, ev) => s + eventRevenue(ev), 0),
    [state.events, foodMap]
  );

  const eventsThisMonth = useMemo(
    () => state.events.filter(ev => {
      const [y, m] = ev.date.split('-').map(Number);
      return y === currentYear && (m - 1) === currentMonth;
    }).length,
    [state.events, currentMonth, currentYear]
  );

  const avgCost = useMemo(
    () => state.events.length > 0 ? totalRevenue / state.events.length : 0,
    [totalRevenue, state.events.length]
  );

  const avgGuests = useMemo(() => {
    const withGuests = state.events.filter(ev => ev.guestCount > 0);
    return withGuests.length > 0
      ? Math.round(withGuests.reduce((s, ev) => s + ev.guestCount, 0) / withGuests.length)
      : 0;
  }, [state.events]);

  // ── Monthly revenue bar chart (last 6 months) ─────────────────────────────
  const monthlyRevenue = useMemo(() => {
    const data: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const revenue = state.events
        .filter(ev => {
          const [ey, em] = ev.date.split('-').map(Number);
          return ey === y && (em - 1) === m;
        })
        .reduce((s, ev) => s + eventRevenue(ev), 0);
      data.push({ month: SHORT_MONTH_NAMES[m], revenue });
    }
    return data;
  }, [state.events, currentMonth, currentYear, foodMap]);

  // ── Top food items by spend ────────────────────────────────────────────────
  const topFoodItems = useMemo(() => {
    const spendMap = new Map<string, number>();
    for (const ev of state.events) {
      for (const ei of ev.items) {
        const fi = foodMap.get(ei.foodItemId);
        if (!fi) continue;
        const cost = calcLineCost(fi.pricePerUnit, fi.defaultQuantity, ei.quantity);
        spendMap.set(fi.id, (spendMap.get(fi.id) ?? 0) + cost);
      }
    }
    return Array.from(spendMap.entries())
      .map(([id, spend]) => ({ name: foodMap.get(id)?.name ?? id, spend }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 6);
  }, [state.events, foodMap]);

  // ── Category share donut ──────────────────────────────────────────────────
  const categoryShare = useMemo(() => {
    const map = new Map<string, number>();
    for (const ev of state.events) {
      for (const ei of ev.items) {
        const fi = foodMap.get(ei.foodItemId);
        if (!fi) continue;
        const catName = state.categories.find(c => c.id === fi.categoryId)?.name ?? 'Other';
        const cost = calcLineCost(fi.pricePerUnit, fi.defaultQuantity, ei.quantity);
        map.set(catName, (map.get(catName) ?? 0) + cost);
      }
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [state.events, foodMap, state.categories]);

  // ── AI Insights ──────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    const tips: string[] = [];

    if (state.events.length === 0) {
      return ["Add your first event to start seeing insights!"];
    }

    // Busiest weekday
    const dayCount: number[] = Array(7).fill(0);
    for (const ev of state.events) {
      const [y, m, d] = ev.date.split('-').map(Number);
      dayCount[new Date(y, m-1, d).getDay()]++;
    }
    const maxDayIdx = dayCount.indexOf(Math.max(...dayCount));
    if (dayCount[maxDayIdx] > 0) {
      tips.push(`📅 Your busiest day is ${DAY_NAMES_FULL[maxDayIdx]} (${dayCount[maxDayIdx]} event${dayCount[maxDayIdx] > 1 ? 's' : ''}).`);
    }

    // Top item
    if (topFoodItems.length > 0) {
      tips.push(`🍽️ "${topFoodItems[0].name}" is your highest-revenue food item at ${formatINR(topFoodItems[0].spend)}.`);
    }

    // Month-over-month
    const thisM  = monthlyRevenue[monthlyRevenue.length - 1]?.revenue ?? 0;
    const lastM  = monthlyRevenue[monthlyRevenue.length - 2]?.revenue ?? 0;
    if (lastM > 0) {
      const pct = ((thisM - lastM) / lastM * 100).toFixed(0);
      const sign = Number(pct) >= 0 ? '▲' : '▼';
      tips.push(`${sign} Revenue is ${Math.abs(Number(pct))}% ${Number(pct) >= 0 ? 'up' : 'down'} vs. last month.`);
    } else if (thisM > 0) {
      tips.push(`🚀 Great start this month — ${formatINR(thisM)} in revenue!`);
    }

    // Bundle suggestion
    if (topFoodItems.length >= 2) {
      tips.push(`💡 Tip: Consider bundling "${topFoodItems[0].name}" with "${topFoodItems[1].name}" as a combo package to increase bookings.`);
    }

    // Upcoming events reminder
    const totalUpcoming = state.events.reduce((s, ev) => s + getFutureOccurrences(ev).length, 0);
    if (totalUpcoming > 0) {
      tips.push(`🗓️ You have ${totalUpcoming} upcoming event occurrence${totalUpcoming !== 1 ? 's' : ''} in the next 3 months.`);
    }

    return tips;
  }, [state.events, topFoodItems, monthlyRevenue]);

  const chartTooltipStyle = {
    background: 'rgba(13,13,43,0.95)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.5rem',
    color: '#f1f5f9',
    fontSize: '12px',
  };

  return (
    <div className="page-content px-4 pt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="btn-3d btn-icon btn-secondary flex-shrink-0" aria-label="Back">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Analysis</h1>
          <p className="text-sm text-white/50 mt-0.5">AI-powered insights</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KpiCard icon={DollarSign}   label="Total Revenue"      value={formatINR(totalRevenue)} />
        <KpiCard icon={Calendar}     label="Events This Month"  value={String(eventsThisMonth)} />
        <KpiCard icon={TrendingUp}   label="Avg Cost / Event"   value={formatINR(avgCost)} />
        <KpiCard icon={Users}        label="Avg Guests"         value={avgGuests > 0 ? String(avgGuests) : '—'} />
      </div>

      {/* Monthly Revenue Chart */}
      {monthlyRevenue.some(d => d.revenue > 0) && (
        <GlassCard className="p-4 mb-4">
          <h2 className="font-display font-semibold text-white mb-4 text-sm">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: number) => [formatINR(v), 'Revenue']}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="revenue" radius={[6,6,0,0]}>
                {monthlyRevenue.map((_, i) => (
                  <Cell key={i} fill={i === monthlyRevenue.length - 1 ? '#a855f7' : '#7c3aed'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Top Food Items */}
      {topFoodItems.length > 0 && (
        <GlassCard className="p-4 mb-4">
          <h2 className="font-display font-semibold text-white mb-4 text-sm">Top Items by Revenue</h2>
          <div className="flex flex-col gap-2">
            {topFoodItems.map((item, i) => {
              const max = topFoodItems[0].spend;
              const pct = max > 0 ? (item.spend / max) * 100 : 0;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-4 flex-shrink-0 text-right">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs text-white/80 truncate">{item.name}</span>
                      <span className="text-xs text-violet-300 font-semibold flex-shrink-0">{formatINR(item.spend)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i+1) % CHART_COLORS.length]})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Category Donut */}
      {categoryShare.length > 0 && (
        <GlassCard className="p-4 mb-4">
          <h2 className="font-display font-semibold text-white mb-4 text-sm">Spend by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryShare}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={3}
              >
                {categoryShare.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{value}</span>}
              />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: number) => [formatINR(v), 'Spend']}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* AI Insights */}
      <GlassCard className="p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-yellow-400" />
          <h2 className="font-display font-semibold text-white text-sm">AI Insights</h2>
        </div>
        <div className="flex flex-col gap-2.5">
          {insights.map((tip, i) => (
            <div
              key={i}
              className="text-sm text-white/70 leading-relaxed p-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {tip}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Retention notice */}
      <div className="flex items-start gap-2 px-1 pb-2">
        <Info size={13} className="text-white/25 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/25 leading-relaxed">
          Events older than 3 months are removed automatically on app load and every 24 hours.
        </p>
      </div>
    </div>
  );
}
