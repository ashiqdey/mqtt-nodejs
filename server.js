/*
reference
https://github.com/moscajs/aedes/issues/647

*/

const express = require('express');
const app = express();

const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);

const ws = require('websocket-stream');

const ports = {
    mqtt : 1883,
    ws : 8080,
    wss : 8081,
}



const server_config = {
    HTTPS: process.env.HTTPS,

    SSL_KEY: process.env.SSL_KEY,
    SSL_CRT: process.env.SSL_CRT,
    SSL_CAB: process.env.SSL_CAB,
}




const host = '0.0.0.0' // localhost


server.listen(ports.mqtt, function () {
    console.log(`MQTT Broker running on port: ${ports.mqtt}`);
});


// -------- non-SSL websocket port -------------
var wsServer = require('http').createServer(app)
ws.createServer({ server: wsServer}, aedes.handle)
wsServer.listen(ports.ws, host, function () {
    console.log('WS server listening on port', ports.ws)
})
// -------- non-SSL websocket port -------------



// -------- SSL websocket port -------------
if (server_config.HTTPS == 'https') {
    const fs = require("fs");
    const https = require("https");

    const options = {
        key: fs.readFileSync(server_config.SSL_KEY),
        cert: fs.readFileSync(server_config.SSL_CRT),
        ca: [fs.readFileSync(server_config.SSL_CAB), fs.readFileSync(server_config.SSL_CRT)],
        requestCert: false,
        rejectUnauthorized: false
    }
    const wsSslServer = https.createServer(options, app);

    ws.createServer({ server: wsSslServer}, aedes.handle)
    wsSslServer.listen(ports.wss, host, function () {
        console.log('WSS server listening on port', ports.wss)
    })
}


// -------- SSL -------------



// -------- ROUTE -------------
app.get("/", (req, res) => { res.send('running...'); });





// emitted when a client connects to the broker
aedes.on('client', function (client) {
    console.log(`[CLIENT_CONNECTED] Client connected`)
})

// emitted when a client disconnects from the broker
aedes.on('clientDisconnect', function (client) {
    console.log(`[CLIENT_DISCONNECTED] Client disconnected`)
})

// emitted when a client subscribes to a message topic
aedes.on('subscribe', function (subscriptions, client) {
    // console.log(`[TOPIC_SUBSCRIBED] Client ${(client ? client.id : client)} subscribed to topics: ${subscriptions.map(s => s.topic).join(',')} on broker ${aedes.id}`)
    console.log(`[TOPIC_SUBSCRIBED] ${subscriptions.map(s => s.topic).join(',')}`)
})

// emitted when a client unsubscribes from a message topic
aedes.on('unsubscribe', function (subscriptions, client) {
    // console.log(`[TOPIC_UNSUBSCRIBED] Client ${(client ? client.id : client)} unsubscribed to topics: ${subscriptions.join(',')} from broker ${aedes.id}`)
    console.log(`[TOPIC_UNSUBSCRIBED] ${subscriptions.join(',')}`)
})

// emitted when a client publishes a message packet on the topic
aedes.on('publish', async function (packet, client,topic) {
	// console.log(`[MESSAGE_PUBLISHED] ${packet.topic} ${topic}`);

    if (client) {
        console.log(`[MESSAGE_PUBLISHED] ${packet.topic}`)
    }
})