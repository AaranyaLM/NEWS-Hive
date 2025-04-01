import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import Trending from './Pages/Trending';
import Content from './Pages/Content';
import UserAuth from './Pages/UserAuth';
import ForgotPassword from './Pages/ForgotPassword'; 
import ProtectedRoute from './Components/ProtectedRoute';
import Profile from './Pages/Profilepage';
import EditProfilepage from './Pages/EditProfilepage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/userauth" element={<UserAuth />} />
        <Route path="/forgot" element={<ForgotPassword />} /> 
        <Route path="/" element={
          <ProtectedRoute>
            <Homepage />
          </ProtectedRoute>
        } />
        <Route path="/trending" element={
          <ProtectedRoute>
            <Trending />
          </ProtectedRoute>
        } />
        <Route path="/content" element={
          <ProtectedRoute>
            <Content />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfilepage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;