import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, Search, Filter, Receipt } from 'lucide-react';

const Expenses = () => {
  const { expenses, addExpense, deleteExpense } = useFinance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('');
  
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    addExpense({
      amount: parseFloat(amount),
      category,
      note,
      date: new Date().toISOString(),
      type: 'expense'
    });
    
    setAmount('');
    setCategory('');
    setNote('');
    setShowAddForm(false);
  };

  const filteredExpenses = expenses
    .filter(e => e.type === 'expense')
    .filter(e => e.category.toLowerCase().includes(filter.toLowerCase()) || 
                 (e.note && e.note.toLowerCase().includes(filter.toLowerCase())))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expenses</h1>
          <p className="text-secondary">Track and manage your daily spending.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-8 animate-fade-in">
          <h2 className="text-xl font-bold mb-4">New Expense</h2>
          <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label>Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                placeholder="0.00"
              />
            </div>
            <div>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="" disabled>Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Note (Optional)</label>
              <input 
                type="text" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="Lunch at cafe..."
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary w-full">Save Expense</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[rgba(0,0,0,0.1)] rounded-lg border border-[rgba(255,255,255,0.02)] text-secondary">
            <Receipt className="mx-auto mb-4 text-emerald-500 opacity-40 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" size={56} />
            <p className="text-lg font-medium text-white mb-2">No expenses found</p>
            {filter ? <p className="text-sm">Try adjusting your search filters.</p> : <p className="text-sm">Add a new expense to get started.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="pb-3 font-semibold text-secondary">Date</th>
                  <th className="pb-3 font-semibold text-secondary">Category</th>
                  <th className="pb-3 font-semibold text-secondary">Note</th>
                  <th className="pb-3 font-semibold text-secondary text-right">Amount</th>
                  <th className="pb-3 font-semibold text-secondary text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="group hover:bg-[rgba(255,255,255,0.05)] transition-all animate-child-1">
                    <td className="py-4 text-sm">
                      {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4">
                      <span className="badge badge-info">{expense.category}</span>
                    </td>
                    <td className="py-4 text-sm text-secondary">{expense.note || '-'}</td>
                    <td className="py-4 text-right font-semibold text-danger">
                      -₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="btn-icon text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
