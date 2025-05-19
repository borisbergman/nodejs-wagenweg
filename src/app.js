#!/usr/bin/env nodejs

const express = require('express');
const protobuf = require("protobufjs");
const config = require('config');

const app = express();
const mqtt = require('mqtt');
const mosquittopw = config.get('password');
const mosquittouser = config.get('username');

const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

const host = 'wss://boriscornelisbergman.nl:8083'

const options = {
  keepalive: 30,
  clientId: clientId,
  username: mosquittouser,
  password: mosquittopw,
    
  queueQoSZero: true,

  reconnectPeriod: 30 * 1000,
  connectTimeout: 30 * 1000,
}


console.log('connecting mqtt client');
const client = mqtt.connect(host, options);

client.on('reconnect', () => {
  console.log('… Reconnecting …');
});

client.on('error', function (err) {
  console.error(err);
})

client.on('connect', function () {
  console.log('client connected:' + clientId);
})

client.on('offline', () => {
  console.log('Client offline, will queue messages');
});

client.on('message', function (topic, message, packet) {
  console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic)
})

client.on('close', function () {
  console.log(clientId + ' disconnected')
})

app.use('/wagenweg170B/', express.static('public'))
app.use(express.json()); 

app.route('/wagenweg170B/solenoid/')
  .post(function (req, res, next) {  
      protobuf.load("proto/solenoid.proto", function(err, root) {
        var solenoidMessage = root.lookupType("Solenoid");
        var payload = {id : req.body.solenoidid, time : req.body.time};
        var message = solenoidMessage.create(payload);
        var buffer = solenoidMessage.encode(message).finish();
        
        client.publish('/wagenweg/planten/', buffer);            
      });              
      res.send({'opened': req.body.solenoidid} );  
  });

app.route('/wagenweg170B/stop/')
.post(function (req, res, next) {  
    client.publish('/wagenweg/planten/stop', "1");
    res.send({'stopped': 1} );  
});

app.listen(8080)