import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Calendar, Trash2, Bell, Plus } from 'lucide-react';

const Subscriptions = () => {
  const { subscriptions, addSubscription, deleteSubscription } = useFinance();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState('Monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');

  const handleAddSubscription = (e) => {
    e.preventDefault();
    if (!name || !amount || !nextBillingDate) return;
    
    addSubscription({
      name,
      amount: parseFloat(amount),
      cycle,
      nextBillingDate
    });
    
    setName('');
    setAmount('');
    setNextBillingDate('');
    setShowAddForm(false);
  };

  const getDaysUntil = (dateStr) => {
    const nextDate = new Date(dateStr);
    const today = new Date();
    // Reset time portions for accurate day calc
    nextDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = nextDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Sort by days remaining (closest first)
  const sortedSubs = [...subscriptions].sort((a, b) => {
    return getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate);
  });

  const totalMonthly = subscriptions.reduce((sum, s) => {
    if (s.cycle === 'Monthly') return sum + s.amount;
    if (s.cycle === 'Yearly') return sum + (s.amount / 12);
    return sum;
  }, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
          <p className="text-secondary">Keep track of your recurring payments.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          <span>Add Subscription</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card md:col-span-1 border-l-4 border-transparent" style={{ borderLeftColor: 'var(--secondary-color)' }}>
          <h3 className="text-secondary text-sm font-semibold mb-2">Total Monthly Cost</h3>
          <p className="text-3xl font-bold animate-child-1">₹{totalMonthly.toFixed(2)}</p>
          <p className="text-xs text-secondary mt-1">Average calculated from all cycles</p>
        </div>
        <div className="card md:col-span-1 border-l-4 border-transparent" style={{ borderLeftColor: 'var(--danger-color)' }}>
          <h3 className="text-secondary text-sm font-semibold mb-2">Active Subscriptions</h3>
          <p className="text-3xl font-bold animate-child-2">{subscriptions.length}</p>
        </div>
      </div>

      {showAddForm && (
        <div className="card mb-8 animate-fade-in">
          <h2 className="text-xl font-bold mb-4">New Subscription</h2>
          <form onSubmit={handleAddSubscription} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label>Service Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Netflix"
              />
            </div>
            <div>
              <label>Amount (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                placeholder="15.99"
              />
            </div>
            <div>
              <label>Billing Cycle</label>
              <select value={cycle} onChange={(e) => setCycle(e.target.value)}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label>Next Billing Date</label>
              <input 
                type="date" 
                value={nextBillingDate} 
                onChange={(e) => setNextBillingDate(e.target.value)} 
                required 
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary w-full">Save It</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSubs.length === 0 ? (
          <div className="col-span-full card py-16 flex flex-col items-center justify-center text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <Calendar size={56} className="mb-4 text-emerald-500 opacity-40 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            <h3 className="text-xl font-bold text-white mb-2">No subscriptions found</h3>
            <p className="mt-2 text-sm text-secondary">Add your recurring payments to get alerts before they renew.</p>
          </div>
        ) : (
          sortedSubs.map((sub) => {
            const daysLeft = getDaysUntil(sub.nextBillingDate);
            const isSoon = daysLeft <= 7 && daysLeft >= 0;
            const isOverdue = daysLeft < 0;

            return (
              <div key={sub.id} className="card relative overflow-hidden transition-all hover:shadow-lg animate-child-1" style={isSoon ? { borderColor: 'var(--danger-color)', boxShadow: '0 0 20px rgba(244,63,94,0.15)' } : {}}>
                {isSoon && (
                  <div className="absolute top-0 right-0 bg-danger text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-md">
                    <Bell size={12} className="animate-pulse" />
                    Renews Soon
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg text-success" style={{ background: 'rgba(16,185,129,0.1)' }}>
                      {sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{sub.name}</h3>
                      <p className="text-secondary text-xs">{sub.cycle}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteSubscription(sub.id)}
                    className="text-secondary hover:text-danger transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-end">
                  <div>
                    <p className="text-xs text-secondary mb-1">Next Payment</p>
                    <p className={`font-semibold text-sm ${isSoon ? 'text-danger' : isOverdue ? 'text-secondary' : 'text-success'}`}>
                      {isOverdue 
                        ? 'Past Due / Needs Update' 
                        : daysLeft === 0 
                          ? 'Today' 
                          : `In ${daysLeft} days`
                      }
                    </p>
                    <p className="text-xs text-secondary">
                      {new Date(sub.nextBillingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{sub.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
