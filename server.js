/*
reference
https://github.com/moscajs/aedes/issues/647

*/



const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);

const ws = require('websocket-stream')


const port = 1883;

server.listen(port, function () {
    console.log(`MQTT Broker running on port: ${port}`);
});

const wssPort = 1234
const host = '0.0.0.0' // localhost

var wsSslServer = require('http').createServer({})
ws.createServer({ server: wsSslServer}, aedes.handle)
wsSslServer.listen(wssPort, host, function () {
    console.log('WSS server listening on port', wssPort)
})



// emitted when a client connects to the broker
aedes.on('client', function (client) {
    console.log(`[CLIENT_CONNECTED] Client connected`)
})

// emitted when a client disconnects from the broker
aedes.on('clientDisconnect', function (client) {
    console.log(`[CLIENT_DISCONNECTED] Client  disconnected`)
})

// emitted when a client subscribes to a message topic
aedes.on('subscribe', function (subscriptions, client) {
    // console.log(`[TOPIC_SUBSCRIBED] Client ${(client ? client.id : client)} subscribed to topics: ${subscriptions.map(s => s.topic).join(',')} on broker ${aedes.id}`)
    console.log(`[TOPIC_SUBSCRIBED] Client  subscribed to topics: ${subscriptions.map(s => s.topic).join(',')}`)
})

// emitted when a client unsubscribes from a message topic
aedes.on('unsubscribe', function (subscriptions, client) {
    // console.log(`[TOPIC_UNSUBSCRIBED] Client ${(client ? client.id : client)} unsubscribed to topics: ${subscriptions.join(',')} from broker ${aedes.id}`)
    console.log(`[TOPIC_UNSUBSCRIBED] Client  unsubscribed to topics: ${subscriptions.join(',')}`)
})

// emitted when a client publishes a message packet on the topic
aedes.on('publish', async function (packet, client,topic) {
	console.log(`[MESSAGE_PUBLISHED] ${packet.topic} ${topic}`);

    if (client) {
        console.log(`[MESSAGE_PUBLISHED] Client has published message on ${packet.topic}`)
    }
})