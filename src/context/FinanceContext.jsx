import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  // --- State Initialization ---
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('finance_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('finance_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem('finance_subscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('finance_groups');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('finance_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('finance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finance_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('finance_groups', JSON.stringify(groups));
  }, [groups]);

  // --- Expenses Methods ---
  const addExpense = (expense) => {
    setExpenses([...expenses, { ...expense, id: Date.now().toString() }]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- Budgets Methods ---
  const setBudget = (category, amount) => {
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      setBudgets(budgets.map(b => b.category === category ? { category, amount } : b));
    } else {
      setBudgets([...budgets, { category, amount }]);
    }
  };

  const deleteBudget = (category) => {
    setBudgets(budgets.filter(b => b.category !== category));
  };

  // --- Subscriptions Methods ---
  const addSubscription = (sub) => {
    setSubscriptions([...subscriptions, { ...sub, id: Date.now().toString() }]);
  };

  const deleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  // --- Groups (Splitwise) Methods ---
  const addGroup = (groupName, members) => {
    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      members: members.map(m => ({ id: Date.now().toString() + Math.random(), name: m })),
      expenses: []
    };
    setGroups([...groups, newGroup]);
  };

  const addGroupExpense = (groupId, expense) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return { ...g, expenses: [...g.expenses, newExpense] };
      }
      return g;
    }));
  };

  const deleteGroup = (id) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  return (
    <FinanceContext.Provider value={{
      expenses, addExpense, deleteExpense,
      budgets, setBudget, deleteBudget,
      subscriptions, addSubscription, deleteSubscription,
      groups, addGroup, addGroupExpense, deleteGroup
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
