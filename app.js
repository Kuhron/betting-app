const express = require('express');

const app = express();
app.set('view engine', 'ejs');
const port = 3000;

app.get('/', (req, res) => {
  res.render('pages/index');
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})
