var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://192.168.43.116')
client.on('connect', function () {
    client.subscribe('grocered/chat')
})
client.on('message', function (topic, message) {
    context = message.toString();
    console.log(context)
})