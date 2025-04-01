import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import FilterBar from '../Components/FilterBar';
import TrendingFeed from '../Components/TrendingFeed';
import Footer from '../Components/Footer';

const Trending = () => {
  const [search, setSearch] = useState('');
  const [locale, setLocale] = useState('us'); 
  const [category, setCategory] = useState('');

  return (
    <div className="Homepage">
      <Navbar />
      <FilterBar
        search={search} setSearch={setSearch}
        locale={locale} setLocale={setLocale}
        category={category} setCategory={setCategory}
      />
      <TrendingFeed search={search} locale={locale} category={category} />
      <Footer></Footer>
    </div>
  );
};

export default Trending;