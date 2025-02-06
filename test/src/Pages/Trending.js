import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import FilterBar from '../Components/FilterBar';
import TrendingFeed from '../Components/TrendingFeed';
import './Homepage.css';

const Trending = () => {
  const [search, setSearch] = useState('');
  const [locale, setLocale] = useState('us'); // Default to US
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt'); // Default sorting

  return (
    <div className="Homepage">
      <Navbar />
      <FilterBar
        search={search} setSearch={setSearch}
        locale={locale} setLocale={setLocale}
        category={category} setCategory={setCategory}
        sortBy={sortBy} setSortBy={setSortBy}
      />
      <TrendingFeed search={search} locale={locale} category={category} sortBy={sortBy} />
    </div>
  );
};

export default Trending;
