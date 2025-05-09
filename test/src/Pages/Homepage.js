import React, { useState } from 'react';
import Searchbar from '../Components/Searchbar';
import ArticleFeed from '../Components/ArticleFeed';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import './Homepage.css';

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('relevancy');

  const handleSearch = (query, filter, sort) => {
    setSearchQuery(query);
    setFilterBy(filter);
    setSortBy(sort);
  };

  return (
    <>
      <div className="Homepage">
        <Navbar />
        <Searchbar onSearch={handleSearch} />
        <ArticleFeed 
          query={searchQuery} 
          filter={filterBy} 
          sort={sortBy}
        />
      </div>
      <Footer></Footer>
    </>
  );
};

export default Homepage;