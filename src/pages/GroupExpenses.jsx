import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Users, Plus, Trash2, ArrowRightLeft } from 'lucide-react';

const GroupExpenses = () => {
  const { groups, addGroup, addGroupExpense, deleteGroup } = useFinance();
  
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [newMembers, setNewMembers] = useState([]);
  
  const [activeGroup, setActiveGroup] = useState(null);
  
  // Expense Form State
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPaidBy, setExpPaidBy] = useState('');

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName || newMembers.length < 2) {
      alert("A group needs a name and at least 2 members (including you).");
      return;
    }
    addGroup(groupName, newMembers);
    setGroupName('');
    setNewMembers([]);
    setShowNewGroup(false);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (memberName && !newMembers.includes(memberName)) {
      setNewMembers([...newMembers, memberName]);
      setMemberName('');
    }
  };

  const handleRemoveNewMember = (name) => {
    setNewMembers(newMembers.filter(m => m !== name));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expDesc || !expAmount || !expPaidBy) return;
    
    // Default split equally among all members
    const splitAmong = activeGroup.members.map(m => m.id);
    
    addGroupExpense(activeGroup.id, {
      description: expDesc,
      amount: parseFloat(expAmount),
      paidBy: expPaidBy,
      splitAmong
    });
    
    setExpDesc('');
    setExpAmount('');
    setExpPaidBy('');
    setShowExpenseForm(false);
    
    // Update activeGroup local reference to show changes immediately
    // const updated = groups.find(g => g.id === activeGroup.id);
    // Since context state update is async, we don't strictly *need* to do this if we rely on the component re-render,
    // but React handles the re-render when context changes. We can just rely on `groups.find()`.
  };

  // derived active group from context to stay in sync
  const currentGroup = groups.find(g => activeGroup && g.id === activeGroup.id);

  // Settlement Calculation Algorithm
  const calculateSettlements = (group) => {
    if (!group || !group.expenses.length) return [];
    
    const balances = {};
    group.members.forEach(m => { balances[m.id] = 0; });

    group.expenses.forEach(exp => {
      const splitAmount = exp.amount / exp.splitAmong.length;
      
      // Person who paid gets credit
      balances[exp.paidBy] += exp.amount;
      
      // Everyone involved gets debit
      exp.splitAmong.forEach(memberId => {
        balances[memberId] -= splitAmount;
      });
    });

    const debtors = [];
    const creditors = [];

    for (const [id, balance] of Object.entries(balances)) {
      const member = group.members.find(m => m.id === id);
      if (balance < -0.01) debtors.push({ member, amount: Math.abs(balance) });
      else if (balance > 0.01) creditors.push({ member, amount: balance });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let d = 0, c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      
      const settledAmount = Math.min(debtor.amount, creditor.amount);
      
      settlements.push({
        from: debtor.member.name,
        to: creditor.member.name,
        amount: settledAmount
      });

      debtor.amount -= settledAmount;
      creditor.amount -= settledAmount;

      if (debtor.amount < 0.01) d++;
      if (creditor.amount < 0.01) c++;
    }

    return settlements;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Group Split</h1>
          <p className="text-secondary">Split expenses with friends easily.</p>
        </div>
        {!showNewGroup && (
          <button onClick={() => setShowNewGroup(true)} className="btn btn-primary">
            <Plus size={20} />
            Create Group
          </button>
        )}
      </div>

      {showNewGroup && (
        <div className="card mb-8 animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Create New Group</h2>
          <form onSubmit={handleCreateGroup} className="mb-4">
            <div className="mb-4">
              <label>Group Name</label>
              <input 
                type="text" 
                value={groupName} 
                onChange={e => setGroupName(e.target.value)} 
                placeholder="Trip to Hawaii" 
                className="max-w-md"
              />
            </div>
          </form>
          
          <form onSubmit={handleAddMember} className="mb-4 flex gap-2 items-end max-w-md">
            <div className="flex-1">
              <label>Add Member Name</label>
              <input 
                type="text" 
                value={memberName} 
                onChange={e => setMemberName(e.target.value)} 
                placeholder="Alice" 
              />
            </div>
            <button type="submit" className="btn btn-secondary">Add</button>
          </form>
          
          {newMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {newMembers.map(m => (
                <div key={m} className="badge badge-info flex items-center gap-1">
                  {m}
                  <button onClick={() => handleRemoveNewMember(m)} className="ml-1 hover:text-danger">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <button onClick={handleCreateGroup} className="btn btn-primary">Save Group</button>
            <button onClick={() => setShowNewGroup(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {groups.length === 0 && !showNewGroup ? (
        <div className="card py-16 flex flex-col items-center justify-center text-secondary text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <Users size={56} className="mb-4 opacity-40 text-success" />
          <h3 className="text-xl font-bold text-white mb-2">No groups yet</h3>
          <p className="mt-2 text-sm max-w-sm">Create a group to start splitting bills with friends or roommates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT PANEL */}
          <div className="lg:col-span-1 flex flex-col gap-3 w-full">
            <h3 className="font-semibold text-secondary uppercase text-xs tracking-wider">
              Your Groups
            </h3>

            {groups.map(g => (
              <button 
                key={g.id}
                onClick={() => {
                  setActiveGroup(g);
                  setShowExpenseForm(false);
                }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200
                ${
                  currentGroup?.id === g.id
                    ? 'bg-primary text-black font-semibold shadow-lg'
                    : 'bg-surface text-secondary hover:bg-secondary hover:text-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate">{g.name}</span>
                  <span className="text-xs badge badge-info py-0 px-2">
                    {g.members.length}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT PANEL */}
          {currentGroup && (
            <div className="lg:col-span-2 w-full">
              <div className="card mb-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 border-b border-[var(--border-color)] pb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{currentGroup.name}</h2>
                    <p className="text-sm text-secondary mt-1">
                      Members: {currentGroup.members.map(m => m.name).join(', ')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowExpenseForm(!showExpenseForm)} 
                      className="btn btn-primary btn-sm px-4 py-2 text-sm"
                    >
                      <Plus size={16} className="mr-1" /> Add Bill
                    </button>

                    <button 
                      onClick={() => {
                        deleteGroup(currentGroup.id);
                        setActiveGroup(null);
                      }} 
                      className="btn btn-danger btn-sm px-4 py-2 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>


                {/* ADD EXPENSE FORM */}
                {showExpenseForm && (
                  <form 
                    onSubmit={handleAddExpense} 
                    className="mb-6 p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]"
                  >
                    <h4 className="font-bold mb-3">Add New Expense</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div>
                        <label>Description</label>
                        <input 
                          type="text"
                          value={expDesc}
                          onChange={e => setExpDesc(e.target.value)}
                          required
                          placeholder="Dinner at Joe's"
                        />
                      </div>

                      <div>
                        <label>Total Amount (₹)</label>
                        <input 
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={expAmount}
                          onChange={e => setExpAmount(e.target.value)}
                          required
                          placeholder="120.50"
                        />
                      </div>

                      <div>
                        <label>Paid By</label>
                        <select 
                          value={expPaidBy}
                          onChange={e => setExpPaidBy(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select Member</option>
                          {currentGroup.members.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    <p className="text-xs text-secondary mt-3">
                      Split equally among all members by default.
                    </p>

                    <button type="submit" className="btn btn-primary mt-4">
                      Save
                    </button>
                  </form>
                )}


                {/* CONTENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">

                  {/* EXPENSES */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">Expenses</h3>

                    {currentGroup.expenses.length === 0 ? (
                      <p className="text-secondary text-sm italic">
                        No expenses recorded yet.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {currentGroup.expenses.map((exp, i) => {
                          const payer = currentGroup.members.find(m => m.id === exp.paidBy);

                          return (
                            <div 
                              key={i}
                              className="p-3 rounded-lg flex justify-between items-center bg-black/20"
                            >
                              <div>
                                <p className="font-semibold">{exp.description}</p>
                                <p className="text-xs text-secondary">
                                  {payer?.name} paid
                                </p>
                              </div>

                              <p className="font-bold text-lg">
                                ₹{exp.amount.toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>


                  {/* SETTLEMENTS */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">Who owes Who?</h3>

                    {currentGroup.expenses.length === 0 ? (
                      <p className="text-secondary text-sm italic">
                        Add an expense to calculate balances.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {calculateSettlements(currentGroup).length === 0 ? (
                          <p className="text-success text-sm font-semibold">
                            All balances are settled up!
                          </p>
                        ) : (
                          calculateSettlements(currentGroup).map((settlement, i) => (
                            <div 
                              key={i}
                              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                            >
                              <span className="font-semibold">{settlement.from}</span>
                              <ArrowRightLeft size={16} className="text-secondary" />
                              <span className="font-semibold">{settlement.to}</span>

                              <span className="ml-auto font-bold text-danger">
                                ₹{settlement.amount.toFixed(2)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default GroupExpenses;
