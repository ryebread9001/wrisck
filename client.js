
// Set up the websocket
var ws_host = "ws://"+ window.location.host;
var websocket_connection = new WebSocket(ws_host, "whitehead-protocol");

// Recieve Messages
websocket_connection.onmessage = function (evt) {
	console.log(evt.data);
};
