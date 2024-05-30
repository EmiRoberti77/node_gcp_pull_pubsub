const { PubSub } = require('@google-cloud/pubsub');
require('dotenv').config();
console.log('start');

const projectId = 'emitestproject';
const subName = 'projects/emitestproject-424819/subscriptions/mysubscription';
const timeout = 60;
let count = 0;

const pubsub = new PubSub({
  projectId,
});

const subscription = pubsub.subscription(subName);

const messageHandler = (message) => {
  console.log(`received message`);
  console.log(message);
  console.log('count', count++);
};

subscription.on('message', messageHandler);

setTimeout(() => {
  subscription.removeListener('message', messageHandler);
  console.log(`message received ${count}`);
  console.log(`disconnect`);
}, timeout * 1000);

console.log('end');
