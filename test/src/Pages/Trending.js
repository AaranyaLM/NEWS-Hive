import React from 'react';
import Navbar from '../Components/Navbar';
import TrendingFeed from '../Components/TrendingFeed';
import './Homepage.css';

const Trending = () => {
  return (
    <div className="Homepage">
      <Navbar />

      <TrendingFeed />
    </div>
  );
};

export default Trending;
