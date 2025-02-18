import React from 'react';
import '../Components/FilterBar.css'; // Import the CSS file

const FilterBar = ({ search, setSearch, locale, setLocale, category, setCategory, sortBy, setSortBy }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search news..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select className="filter-select" value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="us">United States</option>
        <option value="gb">United Kingdom</option>
        <option value="in">India</option>
        <option value="ca">Canada</option>
      </select>
      <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="business">Business</option>
        <option value="technology">Technology</option>
        <option value="health">Health</option>
        <option value="sports">Sports</option>
        <option value="entertainment">Entertainment</option>
      </select>
      <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="relevancy">Relevance</option>
        <option value="publishedAt">Latest</option>
        <option value="popularity">Popularity</option>
      </select>
      {/* <button className="search-button">Search</button> */}
    </div>
  );
};

export default FilterBar;
