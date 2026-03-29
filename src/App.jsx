import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Subscriptions from './pages/Subscriptions';
import GroupExpenses from './pages/GroupExpenses';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/groups" element={<GroupExpenses />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
