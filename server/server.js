const express = require('express');
const cors = require('cors');
const app = express();
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('c31a65d1df3d4f49a2b9fb548e99bb0b');

app.use(cors());

// Endpoint to fetch news with dynamic query
app.get('/api/news', (req, res) => {
  // const currentDate = new Date().toISOString().split('T')[0];
  // const last30Days = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
  //   .toISOString()
  //   .split('T')[0];
  const query = req.query.q || 'bitcoin'; // Default query
  const filterBy = req.query.filterBy || null; // Filter criteria (source or author)
  const sortBy = req.query.sortBy || 'relevancy'; // Default sort

  newsapi.v2
    .everything({
      q: query,
      // from: last30Days,
      // to: currentDate,
      sortBy: sortBy, // Add sortBy parameter
    })
    .then(response => {
      let filteredArticles = response.articles;

      if (filterBy === 'source') {
        filteredArticles = filteredArticles.filter(article =>
          article.source.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      res.json(filteredArticles);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching news');
    });
});


//For Trending
app.get('/api/trending', (req, res) => {
  const { q, country, category, sortBy } = req.query;

  const options = {
    country: country.toLowerCase() 
  };
  if (!options.country) {
    options.country = 'us'; 
  }

  if (category && category !== '') options.category = category;
  if (q && q !== '') options.q = q;

  console.log('API Request Options:', options); 
  newsapi.v2
    .topHeadlines(options)
    .then(response => {
      console.log('API Response Status:', response.status); 
      res.json(response.articles);
    })
    .catch(err => {
      console.error('News API Error:', err);
      res.status(500).send('Error fetching trending news');
    });
});


//Server start confirmation
app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});