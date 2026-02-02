import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Events from './pages/Events';
import Landing from './pages/Landing';
import EventDetail from './pages/EventDetail';
import Subscribe from './pages/Subscribe';
import Payment from './pages/Payment';
import Results from './pages/Results';
import QuizCreator from './pages/QuizCreator';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PromoterDashboard from './pages/PromoterDashboard';

function App() {
  return (
    <Router>
      <div className="bg-green-100 shadow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/promoter" element={<PromoterDashboard />} />
          <Route path="/events/:id" element={<Events />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/results" element={<Results />} />
          <Route path="/QuizCreator" element={<QuizCreator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
