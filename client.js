
// Set up the websocket
var ws_host = "ws://"+ window.location.host;
var websocket_connection = new WebSocket(ws_host, "whitehead-protocol");

// Recieve Messages
websocket_connection.onmessage = function (evt) {
	console.log(evt.data);
};

// Handle map interaction
var hilight = document.getElementById('hilight');

(function() {
	var countries = document.getElementsByClassName('country');
	for (var i=0; i<countries.length; i++) {
		countries[i].addEventListener('mouseover', mouseoverCountry);
	}
})();

function mouseoverCountry(evt) {
	var country = evt.target;
	var path = country.getAttribute('d');
	hilight.setAttribute('d', path);
	// TODO, draw connections
	console.log(country.getAttribute('id'));
}
