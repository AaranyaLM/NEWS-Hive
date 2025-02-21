import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import Trending from './Pages/Trending';
import Content from './Pages/Content';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/content" element={<Content />} />
      </Routes>
    </Router>
  );
}

export default App;
