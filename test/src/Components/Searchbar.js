import React, { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';
import './Searchbar.css';

const Searchbar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('relevancy');

  // Debounce the search function
  const debouncedSearch = useCallback(
    debounce((search, filter, sort) => {
      onSearch(search, filter, sort);
    }, 200),
    []
  );

  const handleSearchChange = (e) => {
    const newSearchKeyword = e.target.value;
    setSearchKeyword(newSearchKeyword);
    debouncedSearch(newSearchKeyword, filterBy, sortBy);
  };

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilterBy(newFilter);
    debouncedSearch(searchKeyword, newFilter, sortBy);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    debouncedSearch(searchKeyword, filterBy, newSort);
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
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="filter-select"
      >
        <option value="relevancy">Relevance</option>
        <option value="publishedAt">Latest</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  );
};

export default Searchbar;