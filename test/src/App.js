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
import SavedArticlePage from './Pages/SavedArticlePage';
import UserProfile from './Components/UserProfile';
import AdminLogin from './Pages/Admin/AdminLogin';
import AdminPanel from './Pages/Admin/AdminPanel';
import AdminUsers from './Pages/Admin/AdminUsers';
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
      <Route path="/admin/users" element={<AdminUsers />} />
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
          <Route path="/saved" element={
          <SavedArticlePage>
            <EditProfilepage />
          </SavedArticlePage>
        } />
          <Route path="/user/:userId" element={
          <UserProfile>
            <EditProfilepage />
          </UserProfile>
        } />
      </Routes>
    </Router>
  );
}

export default App;