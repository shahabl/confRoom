
/* globals require, console, setTimeout */
var WebSocketClient = require('websocket').client;
 
var client = new WebSocketClient();
 
client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
    console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log("Received: '" + message.utf8Data + "'");
    }
  });

  function sendCommand() {
    if (connection.connected) {
      var number = Math.round(Math.random() * 0xFFFFFF);
      var registerCommand = {'type': 'REGISTER', 'requestID': number, 'room': 1};
      connection.sendUTF(JSON.stringify(registerCommand));
      setTimeout(sendCommand, 1000);
    }
  }
  sendCommand();
});
 
client.connect('ws://localhost:8080/', 'echo-protocol');