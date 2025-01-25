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
        placeholder="Search news..."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
        <option value="">No Filter</option>
        <option value="source">Source</option>
      </select>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default Searchbar;
