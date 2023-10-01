import Aedes from 'aedes';

const aedes = new Aedes();

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

// Start the MQTT broker
const server = require('net').createServer(aedes.handle);
server.listen(1883, () => {
  console.log('MQTT broker is running on port 1883');
});
