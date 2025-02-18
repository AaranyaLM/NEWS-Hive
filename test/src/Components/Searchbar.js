import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import './Searchbar.css';

const Searchbar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterBy, setFilterBy] = useState('');

  // Debounce the search function
  const debouncedSearch = useCallback(
    debounce((search, filter) => {
      onSearch(search, filter);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const newSearchKeyword = e.target.value;
    setSearchKeyword(newSearchKeyword);
    debouncedSearch(newSearchKeyword, filterBy);
  };

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilterBy(newFilter);
    debouncedSearch(searchKeyword, newFilter);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={searchKeyword}
        onChange={handleSearchChange}
        className="search-input"
      />
      <select 
        value={filterBy} 
        onChange={handleFilterChange}
        className="filter-select"
      >
        <option value="">Keyword</option>
        <option value="source">Source</option>
      </select>
    </div>
  );
};

export default Searchbar;