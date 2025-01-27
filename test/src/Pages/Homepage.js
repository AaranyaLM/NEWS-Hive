import React, { useState } from 'react';
import Searchbar from '../Components/Searchbar';
import ArticleFeed from '../Components/ArticleFeed';
import Navbar from '../Components/Navbar';
import './Homepage.css';

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('bitcoin');
  const [filterBy, setFilterBy] = useState('');

  const handleSearch = (query, filter) => {
    setSearchQuery(query);
    setFilterBy(filter);
  };

  return (
    <>
    <div className="Homepage">
    <Navbar />
    <Searchbar onSearch={handleSearch} />
    <ArticleFeed query={searchQuery} filter={filterBy} />
    </div>
  </>
    
  );
};

export default Homepage;
