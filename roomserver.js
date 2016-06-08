/* globals require, console, */
var WebSocketServer = require('websocket').server;
var http = require('http');
 
var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});
 
var wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production 
  // applications, as it defeats all standard cross-origin protection 
  // facilities built into the protocol and the browser.  You should 
  // *always* verify the connection's origin and decide whether or not 
  // to accept it. 
  autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
 // put logic here to detect whether the specified origin is allowed. 
  return true;
}
 
wsServer.on('request', function(request) {
  var jsonMessage;
  var regiesteredRooms = [];
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin 
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }
    
  var connection = request.accept('echo-protocol', request.origin);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      jsonMessage = JSON.parse(message.utf8Data);
      if(jsonMessage.type == 'REGISTER') {
        regiesteredRooms.push(jsonMessage.room);
        console.log('room registered: ' + jsonMessage.room);
        connection.sendUTF(JSON.stringify({'type': 'REGISTER_RESPONSE', 'result': true, 'requestId': jsonMessage.requestID}));
      }
      if(jsonMessage.type == 'GET_ROOM_LIST') {
        console.log('Get Room List recieved');
        connection.sendUTF(JSON.stringify({'type': 'ROOM_LIST', 'list': regiesteredRooms}));
      }
    }
    /*else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }*/
  });
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});