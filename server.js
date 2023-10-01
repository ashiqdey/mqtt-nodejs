const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);

// Handle client connections
aedes.on('client', (client) => {
  console.log(`Client connected: ${client.id}`);
});

// Handle published messages
aedes.on('publish', (packet, client) => {
  console.log(`Received message from ${client ? client.id : 'unknown'}: ${packet.payload.toString()}`);
});

// Start the MQTT broker
server.listen(1883, () => {
  console.log('MQTT broker is running on port 1883');
});
