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
	territories: [],
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
// if it is someones turn, find the ammount of reinforcements they should have
function update_turn() {

}

// make the update for the player tell them:
// the game state (the info on each of the territories)
// their info (their id, the cards they hold, the number of units they can put down)
// general info (ids and names of other players, their color, points, whos turn it is, etc)
// the object will be something like {territories: [{name, owned_by, units, connects_to:[]},...], other_players: [{id, name, ...}, player: {id, name, cards: [], ...}, current_turn, game_state}
// if there was just an attack/defend, send the dice results too, so they can see
function make_update(player_id) {

}

// if everyone is ready, start the game
function start_game(input) {

}

// if the territory is not owned, and the game is in GAME_SETUP
function claim_territory(input) {

}

// if it is the players turn, and they have enough units to add, and they own the territory, and it is time to add
function add_units(input) {

}

// if it is the players turn, and they have the right cards, add the reinforcements to their to_be_added number, and it is time to add
function cash_in(input) {

}

// if it is the players turn, and it is time to attack, role the dice, and do the stuff
function attack(input) {

}

// checks if there is a connection, and if it is the time to reposition, and stuff
function reposition(input) {

}

// checks if it is the users turn, and changes the gamestate to advance to the next user on update_turn
function end_turn(input) {

}
