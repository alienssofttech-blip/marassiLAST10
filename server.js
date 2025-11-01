const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  express.static(__dirname, {
    maxAge: '1y',
    setHeaders(res, resourcePath) {
      if (resourcePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return;
      }

      res.setHeader(
        'Cache-Control',
        `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`
      );
    }
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
