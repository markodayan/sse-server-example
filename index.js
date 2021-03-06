const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const axios = require('axios');

const redis = require('./redis');
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

  // on every 15th second of a minute
let serverJob = schedule.scheduleJob('*/15 * * * * *', getJoke);

async function getJoke () {
  let { data } = await axios.get('https://api.chucknorris.io/jokes/random');
  console.log('Published to redis: ', data.value);
  redis.setex('joke', 60000, data.value);
}

function backendService (req, res, next) {
  // every 30 seconds
  let job = schedule.scheduleJob('*/30 * * * * *', async () => {
    sendMessage(res);
    let data = await redis.get('joke');

    if (!data) {
      res.write('No jokes ready yet!')
    } else {
      res.write('joke: ' + data + '\n\n');
    }
  });

  req.on('close', () => {
    job.cancel();
    console.log('Connection closed (scheduled task cancelled)');
  });
}

function sendMessage (res) {
  let data = {
    data: Math.floor(Math.random() * 1000000).toString(),
    time: (new Date()).toLocaleTimeString(),
  }

  // convert message to string
  data = JSON.stringify(data);
  // send message back
  res.write('event: data\n');
  res.write('data: ' + data + '\n\n');
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
      sendMessage(res);
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
app.get('/data', backendService);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SSE app listening at http://localhost:${PORT}`)
});