import React, { useState } from 'react';
import './Searchbar.css';

const Searchbar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterBy, setFilterBy] = useState('');

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      onSearch(searchKeyword, filterBy);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-input"
      />
      <select 
        value={filterBy} 
        onChange={(e) => setFilterBy(e.target.value)}
        className="filter-select"
      >
        <option value="">Keyword</option>
        <option value="source">Source</option>
      </select>
      <button onClick={handleSearch} className="search-button">Search</button>
    </div>
  );
};

export default Searchbar;