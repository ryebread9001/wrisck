
// Set up the websocket
var ws_host = "ws://"+ window.location.host;
var websocket_connection = new WebSocket(ws_host, "whitehead-protocol");

// Recieve Messages
websocket_connection.onmessage = function (evt) {
	console.log(evt.data);
	var update = JSON.parse(evt.data);
	handle_update(update);
};

// Game code
var gamestate = undefined;

function handle_update(update) {
	gamestate = update;
	// update the map
	update_map();
	// update the UI
	update_UI();
}

function update_map() {

}

// updates the markers color and number
function update_marker(name, color, number) {
	var circle = document.getElementById(name + '_markerc');
    	circle.setAttribute('fill', color);
	var text = document.getElementById(name + '_markert');
	text.innerHTML = number;
}

// draws a marker on a territory, with team color and number of units, called once at start
function mark_territory(name, color, number) {
	// get territory
	var ter = document.getElementById(name);
	var par = ter.parentNode;
	// get center
	var bbox = ter.getBBox();

	//var x = Math.floor(bbox.left + bbox.width/2.0);
	//var y = Math.floor(bbox.top + bbox.height/2.0);
	var x = (bbox.x + (bbox.width/2.0));
	var y = (bbox.y + (bbox.height/2.0));
	// draw a circle of the color
	// TODO make a stroke to the circle of a slightly darker color
	var svgNS = ter.namespaceURI;
	var circle = document.createElementNS(svgNS,'circle');
	circle.setAttribute('id', name + '_markerc');
    	circle.setAttribute('cx',x);
    	circle.setAttribute('cy',y);
    	circle.setAttribute('r',15);
    	circle.setAttribute('stroke-width',4);
    	circle.setAttribute('style', 'pointer-events:none;'); // pass though mouseover
    	circle.setAttribute('fill', color);
	var text = document.createElementNS(svgNS, 'text');
	text.setAttribute('id', name + '_markert');
	text.setAttribute('x',x);
	text.setAttribute('y',y)
    	text.setAttribute('stroke', '#000');
    	text.setAttribute('fill', '#000');
    	text.setAttribute('font-size', 15);
	text.setAttribute('text-anchor', 'middle');
	text.setAttribute('dominant-baseline', 'central');
    	text.setAttribute('style', 'pointer-events:none;'); // pass through mouseover
	text.innerHTML = number;
	par.appendChild(circle);
	par.appendChild(text);
}

function update_UI() {

}

// Handle interaction

var hilight = document.getElementById('hilight');

function mouseoverCountry(evt) {
	var country = evt.target;
	var path = country.getAttribute('d');
	hilight.setAttribute('d', path);
	// TODO, draw connections
	console.log(country.getAttribute('id'));
}

// init

(function() {
	var countries = document.getElementsByClassName('country');
	for (var i=0; i<countries.length; i++) {
		countries[i].addEventListener('mouseover', mouseoverCountry);
		mark_territory(countries[i].getAttribute('id') ,'grey','0')
	}
})();

