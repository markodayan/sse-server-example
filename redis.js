const redis = require('redis');
const { promisify } = require('util');

const REDIS_PORT = 6379;
let client = redis.createClient(REDIS_PORT);

client.on('connect', () => {
  console.log(`Redis connected on port ${REDIS_PORT}`);
});

client.on('error', (error) => {
  console.error(error);
});

const get = promisify(client.get).bind(client);
const setex = promisify(client.setex).bind(client);

module.exports = {
  get,
  setex,
}