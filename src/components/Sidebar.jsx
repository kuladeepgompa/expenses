import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, CreditCard, Users, Sun, Moon } from 'lucide-react';

const Sidebar = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt size={20} /> },
    { name: 'Budgets', path: '/budgets', icon: <PieChart size={20} /> },
    { name: 'Subscriptions', path: '/subscriptions', icon: <CreditCard size={20} /> },
    { name: 'Group Split', path: '/groups', icon: <Users size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-xl shadow-md">
          F
        </div>
        <h1 className="text-xl font-bold m-0 tracking-tight">Finova</h1>
      </div>
      
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg nav-item ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-[var(--border-color)] flex flex-col gap-6">
        <div className="flex justify-between items-center px-2">
          <span className="text-sm font-medium text-secondary">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <button 
            onClick={toggleTheme}
            className="btn-icon"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-surface-light border border-primary flex items-center justify-center text-primary font-bold shadow-sm">U</div>
          <div>
            <p className="text-sm font-semibold">User Account</p>
            <p className="text-xs text-secondary mt-1"><span className="badge badge-success px-2 py-0">Pro Plan</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
