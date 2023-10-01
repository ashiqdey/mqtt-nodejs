// @ts-nocheck
require('dotenv').config();

import Aedes, { AuthErrorCode } from 'aedes';
import http from 'http';
import https from 'https';
import ws from 'websocket-stream';
import fs from 'fs';
import net from 'net';

const aedes = new Aedes();

// ------------------config---------------------

const PORTS = {
  mqtt: process.env.MQTT || 1883,
  ws: process.env.WS || 8080,
  wss: process.env.WSS || 8081,
};

const config = {
  HTTPS: process.env.HTTPS === 'https' || false,

  SSL_KEY: process.env.SSL_KEY,
  SSL_CERTIFICATE: process.env.SSL_CERTIFICATE,
  SSL_CABULDLE: process.env.SSL_CABULDLE,

  AUTH_USERNAME: process.env.AUTH_USERNAME || '',
  AUTH_PASSWORD: process.env.AUTH_PASSWORD || '',
};
// ------------------config---------------------

// Start the MQTT broker
const server = net.createServer(aedes.handle);
server.listen(PORTS.mqtt, () => {
  console.log(`MQTT broker is running on port ${PORTS.mqtt}`);
});
// ------------------config---------------------

// -------- non-SSL websocket port -------------
// var wsServer = require('http').createServer(app);
// ws.createServer({ server: wsServer }, aedes.handle);
// wsServer.listen(PORTS.ws, host, function () {
//   console.log('WS server listening on port', PORTS.ws);
// });

// Create an HTTP server (or you can use an existing one)
const httpServer = http.createServer();

// Create a WebSocket server for WS & WSS
ws.createServer({ server: httpServer }, aedes.handle);
// Start the HTTP server (for WS)
httpServer.listen(PORTS.ws, () => {
  console.log(`HTTP and WebSocket server is running on port ${PORTS.ws}`);
});
// -------- non-SSL websocket port -------------


// -------- SSL websocket port -------------
if (config.HTTPS) {
  const httpsOptions = {
    key: fs.readFileSync(config.SSL_KEY),
    cert: fs.readFileSync(config.SSL_CERTIFICATE),
    ca: [
      fs.readFileSync(config.SSL_CABULDLE),
      fs.readFileSync(config.SSL_CERTIFICATE),
    ],
    requestCert: false,
    rejectUnauthorized: false,
  };
  const httpsServer = https.createServer(httpsOptions);
  // const wssServer = https.createServer(httpsOptions, app);

  ws.createServer({ server: httpsServer }, aedes.handle);

  // Start the HTTPS server (for WSS)
  httpsServer.listen(PORTS.wss, () => {
    console.log(
      `HTTPS and WebSocket Secure (WSS) server is running on port ${PORTS.wss}`
    );
  });
}
// -------- SSL websocket port-------------





// -----------------------------------
//
//           aedes events
//
// -----------------------------------

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
aedes.authenticate = (client, username, password, callback) => {
  if (!password) {
    // Handle the case where the password is undefined or empty
    const error = new Error('Authentication Failed!! Password required.');
    error.returnCode = AuthErrorCode.NOT_AUTHORIZED;
    console.log('Error! Authentication failed.');
    return callback(error, false);
  }

  const passwordStr = Buffer.from(password, 'base64').toString();
  if (
    username === config.AUTH_USERNAME &&
    passwordStr === config.AUTH_PASSWORD
  ) {
    return callback(null, true);
  }
  const error = new Error('Authentication Failed!! Invalid user credentials.');
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
// -------- aedes events -------------
