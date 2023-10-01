const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883', {
// const client = mqtt.connect('ws://localhost:8080', {
  clientId: 'my-client',
  username: 'username',
  password: 'password',
});


client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('my-topic');

  setInterval(function () {
    client.publish(
      'my-topic',
      JSON.stringify({ payload: 'Hello mqtt', date: new Date().getSeconds() })
    );
    console.log('Message Sent');
  }, 5000);
});

client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
});

