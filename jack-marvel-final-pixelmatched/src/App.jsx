import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link,useNavigate } from 'react-router-dom';
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


function App() {
  return (
    <Router>
      {/* This div adds top padding so content isn't hidden behind header */}
      <div className=" bg-green-100 shadow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/Register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          {/* <Route path="/events" element={<Events />} /> */}
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
