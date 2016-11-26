var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
 
// Create web server
var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);

  var file = "./index.html";
  if (request.url == "/client.js") {
    file = "./client.js";
  }
  var fstream = fs.createReadStream(file);
  fstream.pipe(response);

});
server.listen(8080, function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

// Create web socket server
wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

// Handle new connections
var next_id;
wsServer.on('request', function(request) {
  var connection = request.accept('whitehead-protocol', request.origin);
  connection.player_id = next_id;
  next_id++;
  add_player(connection.player_id);
  console.log((new Date()) + ' Connection accepted. Id = '+ connection.player_id);

  // handle messages from the client
  connection.on('message', function(message) {
    console.log('Received Message: ' + message.utf8Data);
    var message_object = JSON.parse(message.utf8Data);
    message_object.player_id = connection.player_id;
    // update the game based on the message
    handle_command(message_object);
    // send an update to everyone, if there is one
    for (conn of wsServer.connections) {
      update = make_update(conn.player_id);
      conn.sendUTF(JSON.stringify(update));
    }
  });

  // handle disconnect
  connection.on('close', function(reasonCode, description) {
    console.log((new Date()) + ' Peer ' + connection.player_id + ' disconnected.');
  });
});



// Game Code
// Game states
const GAME_JOIN = 0;
const GAME_SETUP_CLAIM = 1;
const GAME_SETUP_ADD = 2;
const GAME_PLAY_ADD = 3;
const GAME_PLAY_ATTACK = 4;
const GAME_END = 5;

var gamestate = {
	territories: [
		{
			name: "East Africa",
			owner_id: -1,
			unit_count: 0,
			connections: ["Egypt", "North Africa", "Congo", "Madagascar", "South Africa", "Middle East"],
		},
		{
			name: "Egypt",
			owner_id: -1,
			unit_count: 0,
			connections: ["Southern Europe", "North Africa", "East Africa", "Middle East"],
		},
		{
			name: "Congo",
			owner_id: -1,
			unit_count: 0,
			connections: ["North Africa", "East Africa", "South Africa"],
		},
		{
			name: "Madagascar",
			owner_id: -1,
			unit_count: 0,
			connections: ["East Africa", "South Africa"],
		},
		{
			name: "South Africa",
			owner_id: -1,
			unit_count: 0,
			connections: ["Madagascar", "East Africa", "Congo"],
		},
		{
			name: "North Africa",
			owner_id: -1,
			unit_count: 0,
			connections: ["Western Europe", "Egypt", "East Africa", "Congo", "Southern Europe"],
		},
		{
			name: "Afghanistan",
			owner_id: -1,
			unit_count: 0,
			connections: ["Middle East", "Ukraine", "India", "Ural", "China"],
		},
		{
			name: "India",
			owner_id: -1,
			unit_count: 0,
			connections: ["Middle East", "Afghanistan", "China", "Siam"],
		},
		{
			name: "Irkutsk",
			owner_id: -1,
			unit_count: 0,
			connections: ["Yakutsk", "Siberia", "Mongolia", "Kamchatka"],
		},
		{
			name: "Kamchatka",
			owner_id: -1,
			unit_count: 0,
			connections: ["Alaska", "Mongolia", "Irkutusk", "Yakutusk", "Japan"],
		},
		{
			name: "Middle East",
			owner_id: -1,
			unit_count: 0,
			connections: ["Egypt", "East Africa", "Southern Europe", "Ukraine", "Afghanistan", "India"],
		},
		{
			name: "Mongolia",
			owner_id: -1,
			unit_count: 0,
			connections: ["China", "Irkutsk", "Siberia", "Japan", "Kamchatka"],
		},
		{
			name: "Siam",
			owner_id: -1,
			unit_count: 0,
			connections: ["India", "China", "Indonesia"],
		},
		{
			name: "China",
			owner_id: -1,
			unit_count: 0,
			connections: ["India", "Siam", "Afghanistan", "Ural", "Siberia", "Mongolia"],
		},
		{
			name: "Japan",
			owner_id: -1,
			unit_count: 0,
			connections: ["Mongolia", "Kamchatka"],
		},
		{
			name: "Siberia",
			owner_id: -1,
			unit_count: 0,
			connections: ["Ural", "China", "Mongolia", "Irkutsk", "Yakutsk"],
		},
		{
			name: "Ural",
			owner_id: -1,
			unit_count: 0,
			connections: ["Ukraine", "Afghanistan", "China", "Siberia"],
		},
		{
			name: "Yakutsk",
			owner_id: -1,
			unit_count: 0,
			connections: ["Siberia", "Irkutsk", "Kamchatka"],
		},
		{
			name: "Eastern Austrailia",
			owner_id: -1,
			unit_count: 0,
			connections: ["Western Austrailia", "New Guinea"],
		},
		{
			name: "New Guniea",
			owner_id: -1,
			unit_count: 0,
			connections: ["Indonesia", "Western Austrailia", "Eastern Austrailia"],
		},
		{
			name: "Western Austrailia",
			owner_id: -1,
			unit_count: 0,
			connections: ["Indonesia", "Eastern Australia", "New Guinea"],
		},
		{
			name: "Indonesia",
			owner_id: -1,
			unit_count: 0,
			connections: ["Siam", "New Guinea", "Western Austrailia"],
		},
		{
			name: "Great Britain",
			owner_id: -1,
			unit_count: 0,
			connections: ["Iceland", "Scandinavia", "Northern Europe", "Western Europe"],
		},
		{
			name: "Iceland",
			owner_id: -1,
			unit_count: 0,
			connections: ["Greenland", "Great Britain", "Scandinavia"],
		},
		{
			name: "Northern Europe",
			owner_id: -1,
			unit_count: 0,
			connections: ["Great Britain", "Western Europe", "Southern Europe", "Scandinavia", "Ukraine"],
		},
		{
			name: "Scandinavia",
			owner_id: -1,
			unit_count: 0,
			connections: ["Iceland", "Great Britain", "Northern Europe", "Ukraine"],
		},
		{
			name: "Southern Europe",
			owner_id: -1,
			unit_count: 0,
			connections: ["Western Europe", "Northern Europe", "Ukraine", "Northern Europe", "Egypt", "Middle East"],
		},
		{
			name: "Ukraine",
			owner_id: -1,
			unit_count: 0,
			connections: ["Scandinavia", "Northern Europe", "Southern Europe", "Middle East", "Afghanistan", "Ural"],
		},
		{
			name: "Western Europe",
			owner_id: -1,
			unit_count: 0,
			connections: ["Great Britain", "Northern Europe", "Southern Europe", "North Africa"],
		},
		{
			name: "Alaska",
			owner_id: -1,
			unit_count: 0,
			connections: ["Northwest Territory", "Alberta"],
		},
		{
			name: "Alberta",
			owner_id: -1,
			unit_count: 0,
			connections: ["Alaska", "Western United States", "Ontario", "Northwest Territory"],
		},
		{
			name: "Central America",
			owner_id: -1,
			unit_count: 0,
			connections: ["Western United States", "Eastern United States", "Venezuela"],
		},
		{
			name: "Eastern United States",
			owner_id: -1,
			unit_count: 0,
			connections: ["Ontario", "Quebec", "Western United States", "Central America"],
		},
		{
			name: "Greenland",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Northwest Territory",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Ontario",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Western United States",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Quebec",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Argentina",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Brazil",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Peru",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
		{
			name: "Venezuela",
			owner_id: -1,
			unit_count: 0,
			connections: [],
		},
	],
	continents: [
		{
			name: "North America",
			territories: ["Alberta",],
		},
	],
	players: [],
	player_turn: -1,
	state: GAME_JOIN,
	card_bonus: 6, // CHECK THIS
};

// Handle the messages
// Input is the object they sent us
function handle_command(input) {
  if (input.command === undefined) {
    // bad input
    console.log("Bad input: no command field");
    return undefined;
  }
  switch (input.command) {
	case "add_player_name":
	  add_player(input);
	  break;
    case "start_game":
      start_game(input);
      break;
    case "claim_territory":
      claim_territory(input);
      break;
    case "add_units":
      add_units(input);
      break;
    case "cash_in":
      cash_in(input);
      break;
    case "attack":
      attack(input);
      break;
    case "reposition":
      reposition(input);
      break;
    case "end_turn":
      end_turn(input);
      break;
  }
  // update turn and game state
  update_turn();
}

// see if it should be someone else's turn, and if the game should move to a new state, also check if they own the territories for extra units
// if it is someones turn, find the amount of reinforcements they should have
function update_turn() {
	switch (gamestate.state) {
		case GAME_JOIN:
			// check if we should start
			
			break;
		case GAME_SETUP_CLAIM:
			// check if all territories are claimed
			break;
	}
}

// make the update for the player tell them:
// the game state (the info on each of the territories)
// their info (their id, the cards they hold, the number of units they can put down)
// general info (ids and names of other players, their color, points, whos turn it is, etc)
// the object will be something like {territories: [{name, owned_by, units, connects_to:[]},...], other_players: [{id, name, ...}, player: {id, name, cards: [], ...}, current_turn, game_state}
// if there was just an attack/defend, send the dice results too, so they can see
function make_update(player_id) {

}

function add_player(player_id) {
	var newplayer = {
		name: undefined,
		id: player_id,
		cards: [],
		start_vote: false,
	};
}

function add_player_name(input) {
	// input has field string 'set_name'
	
}
	
// if everyone is ready, start the game
function start_game(input) {

}

// if the territory is not owned, and the game is in GAME_SETUP, also add a unit there
function claim_territory(input) {

}

// if it is the players turn, and they have enough units to add, and they own the territory, and it is time to add
function add_units(input) {

}

// if it is the players turn, and they have the right cards, add the reinforcements to their to_be_added number, and it is time to add
function cash_in(input) {

}

// if it is the players turn, and it is time to attack, rol the dice, and do the stuff
function attack(input) {

}

// checks if there is a connection, and if it is the time to reposition, and stuff
function reposition(input) {

}

// checks if it is the users turn, and changes the gamestate to advance to the next user on update_turn
function end_turn(input) {

}
