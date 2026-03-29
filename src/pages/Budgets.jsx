import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Trash2, Target } from 'lucide-react';

const Budgets = () => {
  const { budgets, setBudget, deleteBudget, expenses } = useFinance();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  
  const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

  const handleSetBudget = (e) => {
    e.preventDefault();
    if (!category || !amount) return;
    setBudget(category, parseFloat(amount));
    setCategory('');
    setAmount('');
  };

  // Calculate current month's expenses per category
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const calculateSpent = (cat) => {
    return expenses
      .filter(e => e.type === 'expense' && e.category === cat)
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Budgets</h1>
        <p className="text-secondary">Set spending limits and monitor your goals for this month.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card sticky top-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target size={20} className="text-primary" />
              Set Budget
            </h2>
            <form onSubmit={handleSetBudget} className="flex flex-col gap-4">
              <div>
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Monthly Limit (₹)</label>
                <input 
                  type="number" 
                  step="1" 
                  min="1" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                  placeholder="500"
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2">Save Budget</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {budgets.length === 0 ? (
            <div className="card text-center py-16 flex flex-col items-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <PieChart size={56} className="mb-4 text-emerald-500 opacity-40 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
              <h3 className="text-xl font-bold text-white mb-2">No budgets set</h3>
              <p className="mt-2 text-sm text-secondary max-w-sm">Create a budget limit from the left panel to start tracking your spending goals.</p>
            </div>
          ) : (
            budgets.map((b) => {
              const spent = calculateSpent(b.category);
              const percentage = Math.min((spent / b.amount) * 100, 100);
              const isOver = spent > b.amount;
              const isWarning = percentage >= 80 && !isOver;

              let barColor = 'bg-primary';
              if (isOver) barColor = 'bg-danger';
              else if (isWarning) barColor = 'bg-yellow-500';

              return (
                <div key={b.category} className="card p-5 group flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="badge badge-info">{b.category}</span>
                    </div>
                    <button 
                      onClick={() => deleteBudget(b.category)}
                      className="btn-icon text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete budget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className={`text-2xl font-bold ${isOver ? 'text-danger' : ''}`}>
                        ₹{spent.toFixed(2)}
                      </span>
                      <span className="text-secondary text-sm ml-1">/ ₹{b.amount.toFixed(2)}</span>
                    </div>
                    <span className={`text-sm font-semibold ${isOver ? 'text-danger' : isWarning ? 'text-yellow-500' : 'text-success'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${barColor}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  {isOver && (
                    <p className="text-danger text-xs mt-2 font-medium">You have exceeded this budget by ₹{(spent - b.amount).toFixed(2)}!</p>
                  )}
                  {isWarning && (
                    <p className="text-yellow-500 text-xs mt-2 font-medium">Approaching budget limit.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
