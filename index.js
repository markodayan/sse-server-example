const express = require('express');
const cors = require('cors');

const { randomInteger } = require('./utils/index');

let clients = [];

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));

const headers = {
  'Content-Type': 'text/event-stream',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache'
}

function randomiser (req, res) {
  req.client.random = randomInteger(0, 15);
  clients.push(req.client);
  console.log('client number is', req.client.random);
  
  res.writeHead(200, headers);

  let timer = setInterval(() => {
    let randomNumber = randomInteger(0, 15);
    if (randomNumber === req.client.random) {
      res.write("Match Found!: " + req.client.random + "\n");
      clearInterval(timer);
      res.end();
    } else {
      res.write("Tried: " + randomNumber + "\n");
    }
  }, 1000)

  req.on('close', () => {
    console.log('Connection closed');
  });
}

app.get('/random', randomiser);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SSE app listening at http://localhost:${PORT}`)
});