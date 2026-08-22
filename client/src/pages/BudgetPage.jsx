import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import api from '../services/api';
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  PieChart as PieChartIcon, 
  BarChart2, 
  Receipt, 
  ArrowLeft,
  Calendar,
  Tag,
  FileText,
  Sparkles,
  Check,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import './BudgetPage.css';

const CATEGORY_COLORS = {
  TRANSPORT: '#3b82f6', // Blue
  STAY: '#8b5cf6',      // Purple
  ACTIVITY: '#ec4899',  // Pink
  MEAL: '#f59e0b',      // Amber
  OTHER: '#64748b',     // Slate
};

const CATEGORY_ICONS = {
  TRANSPORT: '🚆',
  STAY: '🏨',
  ACTIVITY: '🎟️',
  MEAL: '🍜',
  OTHER: '📦',
};

export default function BudgetPage() {
  const { tripId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgetData, setBudgetData] = useState(null);
  const [tripInfo, setTripInfo] = useState(null);

  // Edit Budget Modal State
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('INR');
  const [budgetSubmitting, setBudgetSubmitting] = useState(false);

  // Expense Modal State (Add / Edit)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expCategory, setExpCategory] = useState('TRANSPORT');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCurrency, setExpCurrency] = useState('INR');
  const [expDate, setExpDate] = useState('');
  const [expType, setExpType] = useState('ACTUAL');
  const [expSubmitting, setExpSubmitting] = useState(false);

  // Delete Expense State
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  useEffect(() => {
    fetchBudgetAndTripData();
  }, [tripId]);

  const fetchBudgetAndTripData = async () => {
    setLoading(true);
    setError('');
    try {
      const [budgetRes, tripRes] = await Promise.all([
        api.get(`/budget/${tripId}`),
        api.get(`/trips/${tripId}`),
      ]);

      if (budgetRes.data?.success) {
        setBudgetData(budgetRes.data.data);
        setBudgetAmount(budgetRes.data.data.summary.plannedBudget || '');
        setBudgetCurrency(budgetRes.data.data.summary.currency || 'INR');
      }

      if (tripRes.data?.success) {
        setTripInfo(tripRes.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load budget analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlannedBudget = async (e) => {
    e.preventDefault();
    setBudgetSubmitting(true);
    try {
      const res = await api.put(`/budget/${tripId}`, {
        amount: Number(budgetAmount),
        currency: budgetCurrency,
      });

      if (res.data?.success) {
        setBudgetData(res.data.data);
        setIsEditBudgetOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update planned budget');
    } finally {
      setBudgetSubmitting(false);
    }
  };

  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setExpCategory('TRANSPORT');
    setExpDescription('');
    setExpAmount('');
    setExpCurrency(budgetData?.summary?.currency || 'INR');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpType('ACTUAL');
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense) => {
    setEditingExpenseId(expense._id);
    setExpCategory(expense.category);
    setExpDescription(expense.description);
    setExpAmount(expense.amount);
    setExpCurrency(expense.currency || 'INR');
    setExpDate(new Date(expense.date).toISOString().split('T')[0]);
    setExpType(expense.type);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expDescription.trim() || Number(expAmount) < 0 || !expDate) {
      alert('Please fill in all required expense fields with valid amounts.');
      return;
    }

    setExpSubmitting(true);
    try {
      const payload = {
        category: expCategory,
        description: expDescription.trim(),
        amount: Number(expAmount),
        currency: expCurrency,
        date: expDate,
        type: expType,
      };

      if (editingExpenseId) {
        await api.put(`/budget/expenses/${editingExpenseId}`, payload);
      } else {
        await api.post(`/budget/${tripId}/expenses`, payload);
      }

      await fetchBudgetAndTripData();
      setIsExpenseModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to save expense');
    } finally {
      setExpSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    setDeletingExpenseId(expenseId);
    try {
      await api.delete(`/budget/expenses/${expenseId}`);
      await fetchBudgetAndTripData();
    } catch (err) {
      alert(err.message || 'Failed to delete expense');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading message="Calculating trip budget analytics..." />
      </div>
    );
  }

  if (error || !budgetData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card title="Budget Error">
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-lg mb-4">
            {error || 'Unable to fetch budget information.'}
          </div>
          <Link to="/trips">
            <Button variant="secondary" icon={ArrowLeft}>Back to My Trips</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { summary, categoryBreakdown, dailyBreakdown, expenses } = budgetData;

  // Prepare Pie Chart Data
  const pieChartData = Object.values(categoryBreakdown)
    .filter((c) => c.total > 0)
    .map((c) => ({
      name: c.category,
      value: c.total,
      color: CATEGORY_COLORS[c.category] || '#64748b',
      icon: CATEGORY_ICONS[c.category] || '📦',
    }));

  // Prepare Bar Chart Data for Daily Expenditure
  const barChartData = dailyBreakdown.map((d) => ({
    day: `Day ${d.dayNumber}`,
    date: d.date.split('-').slice(1).join('/'),
    Actual: d.actualCost,
    Estimated: d.estimatedCost,
    DailyBudget: d.dailyBudget,
  }));

  // Calculate Average Daily Cost
  const totalDaysCount = dailyBreakdown.length || 1;
  const avgCostPerDay = Math.round((summary.totalActualCost || summary.totalEstimatedCost) / totalDaysCount);

  // Budget Status Pill
  const getBudgetStatusBadge = () => {
    if (summary.isOverallOverBudget) {
      return <span className="budget-status-pill over">⚠️ Over Budget</span>;
    }
    if (summary.utilizationPercentage > 85) {
      return <span className="budget-status-pill near">⚡ Near Budget Limit</span>;
    }
    return <span className="budget-status-pill safe">✓ Within Budget</span>;
  };

  return (
    <div className="budget-screen-wrapper">
      {/* Header Bar */}
      <div className="budget-header-card">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="screen-title">Trip Budget</h1>
            {getBudgetStatusBadge()}
          </div>
          <p className="screen-subtitle">
            Track your estimated expenses and stay within your travel budget.
          </p>
          {tripInfo?.name && (
            <p className="trip-context-tag">
              {tripInfo.name} • {formatDate(tripInfo.startDate)} — {formatDate(tripInfo.endDate)}
            </p>
          )}
        </div>

        <div className="header-actions-row">
          <button
            onClick={() => alert('✨ AI Budget Optimizer will analyze cost reduction strategies in Phase 6.')}
            className="gt-btn-ai-action"
          >
            <Sparkles size={15} className="text-amber-400" />
            <span>Optimize Budget with AI</span>
          </button>
          <Button variant="secondary" icon={Edit3} onClick={() => setIsEditBudgetOpen(true)}>
            Edit Budget
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleOpenAddExpense}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Prominent Budget Summary Card */}
      <div className="budget-summary-hero-card">
        <div className="hero-kpi-grid">
          <div className="kpi-box">
            <span className="kpi-label">Total Budget</span>
            <div className="kpi-value text-slate-900">
              {summary.currency} {summary.plannedBudget.toLocaleString()}
            </div>
            <span className="kpi-sub font-medium text-slate-500">Planned Target</span>
          </div>

          <div className="kpi-box">
            <span className="kpi-label">Estimated Cost</span>
            <div className="kpi-value text-blue-600">
              {summary.currency} {summary.totalEstimatedCost.toLocaleString()}
            </div>
            <span className="kpi-sub font-medium text-slate-500">Itinerary & Manual</span>
          </div>

          <div className="kpi-box">
            <span className="kpi-label">Actual Spent</span>
            <div className={`kpi-value ${summary.isOverallOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
              {summary.currency} {summary.totalActualCost.toLocaleString()}
            </div>
            <span className="kpi-sub font-medium text-slate-500">Logged Expenses</span>
          </div>

          <div className="kpi-box">
            <span className="kpi-label">Remaining Budget</span>
            <div className={`kpi-value ${summary.remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {summary.currency} {Math.abs(summary.remainingBudget).toLocaleString()}
            </div>
            <span className={`kpi-sub font-bold ${summary.remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {summary.remainingBudget < 0 ? 'Over planned budget' : 'Remaining unspent'}
            </span>
          </div>
        </div>

        {/* Utilization Progress Bar */}
        <div className="hero-progress-section">
          <div className="progress-labels-row">
            <span className="progress-title font-semibold text-slate-700">
              Budget Utilization ({summary.utilizationPercentage}% used)
            </span>
            <span className="progress-detail font-bold text-slate-900">
              {summary.currency} {summary.totalActualCost.toLocaleString()} / {summary.currency} {summary.plannedBudget.toLocaleString()}
            </span>
          </div>
          <div className="progress-track-bg">
            <div 
              className={`progress-fill-bar ${
                summary.utilizationPercentage > 100 
                  ? 'bg-red-500' 
                  : summary.utilizationPercentage > 85 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, summary.utilizationPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Budget Action Entry Banner */}
      <div className="ai-budget-banner">
        <div className="ai-banner-left">
          <div className="ai-sparkle-badge">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="ai-banner-title">✨ Ask AI to optimize my budget</h4>
            <p className="ai-banner-desc">Scan your itinerary for expensive days, train ticket savings, and hotel alternatives.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => alert('✨ AI Budget Assistant will propose cost reduction options in Phase 6.')}
          className="btn-ai-banner"
        >
          Optimize Budget
        </button>
      </div>

      {/* Cost Breakdown Cards (Category Breakdown) */}
      <div className="section-block">
        <div className="section-header-title font-bold text-slate-900 text-lg flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-600" />
          <span>Cost Breakdown by Category</span>
        </div>

        <div className="category-cards-grid">
          {Object.values(categoryBreakdown).map((cat) => {
            const totalForCategory = cat.total;
            const overallRefTotal = summary.totalActualCost > 0 ? summary.totalActualCost : (summary.totalEstimatedCost || 1);
            const percent = summary.plannedBudget > 0 
              ? Math.round((totalForCategory / overallRefTotal) * 100) 
              : 0;

            return (
              <div key={cat.category} className="cost-category-card">
                <div className="cat-card-top">
                  <span className="cat-emoji-icon">{CATEGORY_ICONS[cat.category]}</span>
                  <span className="cat-name-text">{cat.category}</span>
                </div>
                <div className="cat-amount-text">
                  {summary.currency} {totalForCategory.toLocaleString()}
                </div>
                <div className="cat-percent-bar">
                  <div className="cat-percent-track">
                    <div 
                      className="cat-percent-fill"
                      style={{ 
                        width: `${Math.min(100, percent)}%`,
                        backgroundColor: CATEGORY_COLORS[cat.category] || '#2563EB'
                      }}
                    />
                  </div>
                  <span className="cat-percent-val">{percent}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section: Donut Distribution & Daily Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Distribution (Donut Chart) */}
        <Card title="Cost Distribution (Category Share)">
          {pieChartData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <div className="w-full sm:w-1/2 h-60 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${summary.currency} ${val.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
                  <span className="text-xs font-black text-slate-900">
                    {summary.currency} {(summary.totalActualCost || summary.totalEstimatedCost).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-1/2 space-y-2.5 text-xs">
                {pieChartData.map((item) => (
                  <div key={item.name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="font-semibold text-slate-800 capitalize">{item.name.toLowerCase()}</span>
                    </div>
                    <span className="font-bold text-slate-900">{summary.currency} {item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              No expense entries or itinerary activity costs logged yet.
            </div>
          )}
        </Card>

        {/* Daily Spending & Average Cost / Day */}
        <Card title="Daily Spending & Daily Budget Comparison">
          <div className="space-y-4 mt-2">
            {/* Average Cost Per Day Metric */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                <TrendingUp size={15} className="text-blue-600" /> Average Cost / Day
              </span>
              <span className="font-black text-blue-900 text-sm">
                {summary.currency} {avgCostPerDay.toLocaleString()} / day
              </span>
            </div>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => `${summary.currency} ${val.toLocaleString()}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Estimated" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Budget Breakdown & Over-Budget Alert Section */}
      <div className="section-block">
        <div className="daily-header-row">
          <div className="section-header-title">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <span>Daily Spending Breakdown</span>
          </div>

          {/* Budget Alert Status Pill */}
          {summary.overBudgetDaysCount > 0 ? (
            <div className="p-2.5 px-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong>⚠️ Budget Attention:</strong> {summary.overBudgetDaysCount} day(s) exceeded target daily budget ({summary.currency} {dailyBreakdown[0]?.dailyBudget.toLocaleString()}/day).
              </span>
            </div>
          ) : (
            <div className="p-2.5 px-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
              <span>✓ You're within budget! All planned days are within budget limits.</span>
            </div>
          )}
        </div>

        {/* Daily Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {dailyBreakdown.map((dayItem) => {
            const displayCost = (dayItem.actualCost || dayItem.estimatedCost || 0);
            return (
              <div 
                key={dayItem.dayNumber}
                className={`daily-card ${
                  dayItem.overBudget 
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm' 
                    : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">Day {dayItem.dayNumber}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dayItem.date}</span>
                  </div>

                  <div className="daily-card-amount">
                    {summary.currency} {displayCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Target Daily Budget: {summary.currency} {dayItem.dailyBudget.toLocaleString()}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {dayItem.overBudget ? (
                    <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle size={13} /> {summary.currency} {dayItem.difference.toLocaleString()} over
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check size={13} /> Within Budget
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logged Expenses Section */}
      <Card 
        title={`Logged Expense Records (${expenses.length})`} 
        subtitle="Detailed log of actual spending and estimated manual expenses"
      >
        {expenses.length > 0 ? (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {CATEGORY_ICONS[exp.category]} {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {exp.description}
                      {exp.stopId?.cityId?.name && (
                        <span className="block text-[10px] text-slate-400">Stop: {exp.stopId.cityId.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        exp.type === 'ACTUAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {exp.currency || 'INR'} {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditExpense(exp)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit Expense"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          disabled={deletingExpenseId === exp._id}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No expenses recorded yet"
            description="Add actual spending or manual estimated expenses to track your trip finances."
            actionLabel="Add Expense"
            onAction={handleOpenAddExpense}
          />
        )}
      </Card>

      {/* MODAL 1: Edit Planned Budget */}
      <Modal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        title="Set Planned Trip Budget"
      >
        <form onSubmit={handleUpdatePlannedBudget} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Budget Amount"
                type="number"
                min="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                icon={DollarSign}
                placeholder="80000"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Currency</label>
              <select
                value={budgetCurrency}
                onChange={(e) => setBudgetCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditBudgetOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" disabled={budgetSubmitting} type="submit">
              {budgetSubmitting ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Add / Edit Expense */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title={editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TRANSPORT">🚆 Transport</option>
                <option value="STAY">🏨 Stay / Hotel</option>
                <option value="ACTIVITY">🎟️ Activity</option>
                <option value="MEAL">🍜 Meal / Dining</option>
                <option value="OTHER">📦 Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Expense Type</label>
              <select
                value={expType}
                onChange={(e) => setExpType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTUAL">ACTUAL (Logged Spending)</option>
                <option value="ESTIMATED">ESTIMATED (Planned Expense)</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            placeholder="e.g. Shinkansen Bullet Train Ticket"
            value={expDescription}
            onChange={(e) => setExpDescription(e.target.value)}
            icon={FileText}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Amount"
                type="number"
                min="0"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                icon={DollarSign}
                placeholder="3500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Currency</label>
              <select
                value={expCurrency}
                onChange={(e) => setExpCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          <Input
            label="Date"
            type="date"
            value={expDate}
            onChange={(e) => setExpDate(e.target.value)}
            icon={Calendar}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsExpenseModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" disabled={expSubmitting} type="submit">
              {expSubmitting ? 'Saving Expense...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
