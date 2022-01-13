const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/', (req, res) => {
  const creditCardNumber = req.body.creditCardNumber.replace(/ /g, '');

  if (creditCardNumber === '4242424242424242') {
    res.send({ token: 'token_12345' });
  } else {
    res.status(422).send({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Fake API listening at http://localhost:${port}`); // eslint-disable-line no-console
});
