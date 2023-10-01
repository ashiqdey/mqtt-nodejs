// @ts-nocheck
import Aedes, {
  AuthErrorCode,
} from 'aedes';

const aedes = new Aedes();

// Start the MQTT broker
const server = require('net').createServer(aedes.handle);
server.listen(1883, () => {
  console.log('MQTT broker is running on port 1883');
});

// ---------------

// Handle client connections
aedes.on('client', (client) => {
  console.log(`Client connected: ${client.id}`);
});

// Handle published messages
aedes.on('publish', (packet, client) => {
  console.log(
    `Received message from ${
      client ? client.id : 'unknown'
    }: ${packet.payload.toString()}`
  );
});

// authenticate the connecting client
aedes.authenticate = (
  client,
  username,
  password,
  callback
) => {
  if (!password) {
    // Handle the case where the password is undefined or empty
    const error = new Error(
      'Authentication Failed!! Password required.'
    );
    error.returnCode = AuthErrorCode.NOT_AUTHORIZED;
    console.log('Error! Authentication failed.');
    return callback(error, false);
  }

  const passwordStr = Buffer.from(password, 'base64').toString();
  if (username === 'username' && passwordStr === 'password') {
    return callback(null, true);
  }
  const error = new Error(
    'Authentication Failed!! Invalid user credentials.'
  );
  error.returnCode = AuthErrorCode.BAD_USERNAME_OR_PASSWORD;

  console.log('Error ! Authentication failed.');
  return callback(error, false);
};

// authorizing client to publish on a message topic
/*
aedes.authorizePublish = (client, packet, callback) => {
  if (packet.topic === 'home/bedroom/fan') {
    return callback(null);
  }
  console.log('Error ! Unauthorized publish to a topic.');
  return callback(
    new Error('You are not authorized to publish on this message topic.')
  );
};
*/


// emitted when a client connects to the broker
aedes.on('client', function (client) {
  console.log(
    `[CLIENT_CONNECTED] Client ${
      client ? client.id : client
    } connected to broker ${aedes.id}`
  );
});

// emitted when a client disconnects from the broker
aedes.on('clientDisconnect', function (client) {
  console.log(
    `[CLIENT_DISCONNECTED] Client ${
      client ? client.id : client
    } disconnected from the broker ${aedes.id}`
  );
});

// emitted when a client subscribes to a message topic
aedes.on('subscribe', function (subscriptions, client) {
  console.log(
    `[TOPIC_SUBSCRIBED] Client ${
      client ? client.id : client
    } subscribed to topics: ${subscriptions
      .map((s) => s.topic)
      .join(',')} on broker ${aedes.id}`
  );
});

// emitted when a client unsubscribes from a message topic
aedes.on('unsubscribe', function (subscriptions, client) {
  console.log(
    `[TOPIC_UNSUBSCRIBED] Client ${
      client ? client.id : client
    } unsubscribed to topics: ${subscriptions.join(',')} from broker ${
      aedes.id
    }`
  );
});

// emitted when a client publishes a message packet on the topic
aedes.on('publish', async function (packet, client) {
  if (client) {
    console.log(
      `[MESSAGE_PUBLISHED] Client ${
        client ? client.id : 'BROKER_' + aedes.id
      } has published message on ${packet.topic} to broker ${aedes.id}`
    );
  }
});
