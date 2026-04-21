import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Report from './pages/Report';
import AllComplaints from './pages/AllComplaints';
import MyComplaints from './pages/MyComplaints';
import Leaderboard from './pages/Leaderboard';
import Map from './pages/Map';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report" element={<Report />} />
          <Route path="/complaints" element={<AllComplaints />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/profile" element={<Profile />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;