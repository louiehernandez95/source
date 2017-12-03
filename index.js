var express = require('express');
var app = express();
var http = require("http");
var port = 3000;
var Game = require("./game.js");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var autoIncrement = require("mongoose-auto-increment");
var userinfoTotal = {};
var messages = [];
var sockets = [];



<<<<<<< HEAD
//var mconnection = mongoose.connect('mongodb://appUser:password33!@ds119446.mlab.com:19446/connect4');
var mconnection = mongoose.connect('mongodb://localhost/connect');
=======
var mconnection = mongoose.connect('mongodb://appUser:password33!@ds119446.mlab.com:19446/connect4');
var db = mongoose.connection; //var mconnection = mongoose.connect('mongodb://localhost/connect');
>>>>>>> 6d11d7a11aa13ec3fd241b494b0d33583143f4b3
//initialize autoincrement function for comment id
autoIncrement.initialize(mconnection);

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));


// include routes
var routes = require('./router.js');
app.use('/', routes);
app.use("/public/html", express.static(__dirname + '/public/html'));
app.use("/public/styles", express.static(__dirname + '/public/styles'));
app.use("/public/media", express.static(__dirname + '/public/media'));


//parse jQuery JSON to useful JS object
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//defines the first player, the one who waits for the second one to connect
var waitingPlayer = null;

//express serves the static files from the public folder
app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(app.listen(port));

var Player = function(client) {
    this.client = client;
};

//when a player connects
io.sockets.on('connection', function(socket) {
    var player = new Player(socket);

    //sends a new move to the other player
    var sendMove = function(col) {
        console.log("send move ", col);
        player.game.currentPlayer.client.json.send({ move: col });
    };

    //in case of win, sends message to each player with the adequate message
    var sendWin = function(winner) {
        var firstPlayerResult,
            secondPlayerResult;

        if (winner == 0) {
            firstPlayerResult = secondPlayerResult = 'tie';
        } else {
            var firstPlayerIsWinner = (winner == firstPlayer);
            firstPlayerResult = (firstPlayerIsWinner) ? "win" : "lost";
            secondPlayerResult = (firstPlayerIsWinner) ? "lost" : "win";
        }

        firstPlayer.client.json.send({ win: firstPlayerResult });
        secondPlayer.client.json.send({ win: secondPlayerResult });
    }


    //the case when the first player is connected, and waits for the second
    if (waitingPlayer == null) {
        waitingPlayer = player;
    }
    //the second player connects,
    //waitingPlayer becomes null, so another first player can start another game
    else {
        var secondPlayer = player;
        var firstPlayer = waitingPlayer;
        waitingPlayer = null;

        //sending order of turns to connected users
        firstPlayer.client.json.send({ turn: 1 });
        secondPlayer.client.json.send({ turn: 2 });

        //creating a new game, and passing created players and functions
        var game = new Game();
        game.create(firstPlayer, secondPlayer, sendMove, sendWin);

        //sending each player information about the game
        firstPlayer.game = game;
        secondPlayer.game = game;
    }
    //socket waits for the message 'submit-move' to process the sent move
    socket.on('submit-move', function(data) {
        console.log('submit-move: ', data);
        player.game.onMove(data.move);
    });

});
//messages
io.sockets.on('connection', function(socket) {

    sockets.push(socket);

    socket.emit('messages-available', messages);

    socket.on('add-message', function(data) {
        messages.push(data);
        sockets.forEach(function(socket) {
            socket.emit('message-added', data);
        });
    });
});

//define Mongoose schema for info
var UserinfoSchema = mongoose.Schema({
<<<<<<< HEAD
        "ranking": Number,
        "Name": String,
        "Psw":String,
        "Wins": Number,
        "Losses": Number 
  });

  var Userinfo = mongoose.model("users", UserinfoSchema);
 

//json get route - update for mongo
app.get("/html/info.json", function(req, res) {    
      //Sort by wins and losses
       Userinfo.find({}, function (error, info){
        //add some error checking...
       res.json(info);
      // console.log(res.);
      }).sort({"Wins":-1, "Losses":1});
    });
=======
    "ranking": Number,
    "Name": String,
    "Psw": String,
    "Wins": Number,
    "Losses": Number
});

var Userinfo = mongoose.model("users", UserinfoSchema);



>>>>>>> 6d11d7a11aa13ec3fd241b494b0d33583143f4b3


//define Mongoose schema for comments
var CommentSchema = mongoose.Schema({
    //"com_id": Number,
    "com_pid": Number,
    "com_name": String,
    "com_date": Date,
    "com_content": String

});

//model comment
//var Comment = mongoose.model("comments", CommentSchema); 
CommentSchema.plugin(autoIncrement.plugin, 'comments');
var Comment = mconnection.model("comments", CommentSchema);