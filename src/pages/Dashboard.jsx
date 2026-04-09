import { useFinance } from '../context/FinanceContext';
import { Edit2 } from 'lucide-react';

const Dashboard = () => {
  const { expenses, budgets, subscriptions, totalBalance, setTotalBalance } = useFinance();

  const handleEditBalance = () => {
    const newBalance = prompt('Enter your current total balance:', totalBalance);
    if (newBalance !== null && !isNaN(parseFloat(newBalance))) {
      setTotalBalance(parseFloat(newBalance));
    }
  };

  // Calculate current month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses
    .filter(e => e.type === 'expense')
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetPercentage = totalBudget > 0 ? Math.min((monthlyTotal / totalBudget) * 100, 100) : 0;

  // Next 7 days subscriptions
  const today = new Date();
  today.setHours(0,0,0,0);
  const upcomingSubs = subscriptions.filter(sub => {
    const d = new Date(sub.nextBillingDate);
    d.setHours(0,0,0,0);
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-secondary mt-2">Welcome back! Here's an overview of your finances.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card relative group">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-secondary text-sm font-semibold">Total Balance</h3>
            <button 
              onClick={handleEditBalance}
              className="p-1 px-3 flex items-center gap-2 bg-surface-light hover:bg-primary border border-border-color rounded transition-colors text-xs text-secondary hover:text-[var(--on-primary)]"
              title="Edit Balance"
            >
              <Edit2 size={12} />
              <span>Update Balance</span>
            </button>
          </div>
          <p className="text-3xl font-bold text-success animate-child-1">₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-secondary text-sm mt-2 font-medium">Available Cash</p>
        </div>
        <div className="card">
          <h3 className="text-secondary text-sm font-semibold mb-2">Monthly Spending</h3>
          <p className="text-3xl font-bold">₹{monthlyTotal.toFixed(2)}</p>
          {totalBudget > 0 ? (
            <>
              <div className="w-full bg-[var(--bg-color)] h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`${budgetPercentage > 85 ? 'bg-danger' : 'bg-primary'} h-full rounded-full transition-all`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
              <p className="text-secondary text-xs mt-2">{budgetPercentage.toFixed(0)}% of ₹{totalBudget.toFixed(2)} budget</p>
            </>
          ) : (
            <p className="text-secondary text-xs mt-2 italic">No budgets set this month.</p>
          )}
        </div>
        <div className="card">
          <h3 className="text-secondary text-sm font-semibold mb-2">Upcoming Renewals</h3>
          <p className="text-3xl font-bold text-danger animate-child-3">{upcomingSubs.length}</p>
          <p className="text-secondary text-sm mt-2 font-medium">Within next 7 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex flex-col min-h-[300px]">
          <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
          {monthlyExpenses.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-secondary">
              <p>No expenses recorded yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {monthlyExpenses.slice(0, 5).map(e => (
                <div key={e.id} className="flex justify-between items-center p-3 rounded bg-surface border border-transparent hover:border-[rgba(255,255,255,0.1)] transition-all">
                  <div>
                    <p className="font-semibold">{e.category}</p>
                    <p className="text-xs text-secondary">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-danger">-₹{e.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card flex flex-col min-h-[300px]">
          <h2 className="text-xl font-bold mb-4">Budget Overview</h2>
          {budgets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-secondary">
              <p>No budgets set yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {budgets.slice(0, 4).map(b => {
                const spent = expenses
                  .filter(e => e.type === 'expense' && e.category === b.category)
                  .filter(e => {
                    const d = new Date(e.date);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                  })
                  .reduce((sum, e) => sum + e.amount, 0);
                
                const pct = Math.min((spent / b.amount) * 100, 100);
                
                return (
                  <div key={b.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{b.category}</span>
                      <span className="text-secondary">₹{spent.toFixed(2)} / ₹{b.amount}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-color)] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${pct > 90 ? 'bg-danger' : 'bg-secondary'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
