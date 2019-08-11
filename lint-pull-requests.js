let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/payload', async (req, res) => {
  switch (req.body.action) {
    case 'opened':
    // run linter
  }
  res.json({ hello: 'world' });
});

app.listen(port, () => console.log(`This app is listening on port ${port}!`));
