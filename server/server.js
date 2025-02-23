const express = require('express');
const cors = require('cors');
const app = express();
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('c31a65d1df3d4f49a2b9fb548e99bb0b');

app.use(cors());

// Endpoint to fetch news with dynamic query
app.get('/api/news', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const query = req.query.q || 'bitcoin'; // Default query
  const filterBy = req.query.filterBy || null; // Filter criteria (source or author)

  newsapi.v2
    .everything({
      q: query,
      from: last30Days,
      to: currentDate,
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

  const options = {};

  if (country) options.country = country;  // Only set if provided
  if (category) options.category = category;
  if (q) options.q = q;
  if (sortBy) options.sortBy = sortBy || 'relevancy';

  newsapi.v2
    .topHeadlines(options)
    .then(response => res.json(response.articles))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching trending news');
    });
}); 


//Server start confirmation
app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});