var IMGPATHRE = /\.(jpg|png|gif)$/
var SOUNDPATHRE = /\.(ogg|mp3|wav)$/

function validDeck(deck) {
	var total = 0;
	var parsedDeck = JSON.parse(deck);
	for (card in parsedDeck) {
		if (parsedDeck[card] > 4) return false;
		total = total + parsedDeck[card];
	}
	return (total == 60);
}

function gamePrep(socket) {

    socket.on('turn', function(data){
        socket.broadcast.emit('turn', data);
    });
    socket.on('stats', function(data){
        data.player = 'opponent';
        socket.broadcast.emit('stats', data);
    });
    socket.on('addToField', function(card, id){
        socket.broadcast.emit('addToField', card,(0-id));
    });
    socket.on('died', function(id){
        socket.broadcast.emit('died', (0-id));
    });
    socket.on('event', function(phase){
        socket.broadcast.emit('event', 'opp' + phase);
    });
    socket.on('attack', function(attacker, target){
        attacker *= -1;
        target *= -1;
        socket.broadcast.emit('attack', attacker, target);
    });
    socket.on('combat', function(data){
        data.targetID *= -1;
        data.attackerID *= -1;
        socket.broadcast.emit('combat', data);
    });


}





//Card game stuff above this point

var listenPort;
if (!process.argv[2]){
    console.log("Port defaulting to 10800");
    listenPort = 10800;
}
else
    listenPort = process.argv[2];

var welcomeMessage = process.argv[3] || "Welcome to chat!";

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , url = require('url')
  , repl = require('repl')
  , _ = require('underscore');
  //Below are included files created for this project
  //, cards = require('./cards');


var blacklist = []; //Blacklisted IP addresses (banned users)

app.listen(listenPort);
io.set('log level', 1);

function handler (req, res) {
  res.setHeader("Accept-Ranges", "bytes");
    pathname = url.parse(req.url).pathname;
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;

  if (pathname == "/favicon.ico" || pathname == "/") pathname = "/index.html";

  if (pathname == "/decksave") {
      if (req.method == 'POST') {
          console.log(ip + "posted a deck");

          req.on('data', function(chunk) {
                  req.content = (req.content ? req.content + chunk : chunk);
                  });

          req.on('end', function() {
                  // empty 200 OK response for now
                  if (validDeck(req.content.toString())) fs.appendFile("decks.txt", req.content.toString() + "\n");
                  console.log(req.content.toString());
                  res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                  res.end();
                  });
      }
      return;
  }
  if (pathname == "/imgsave") {
      if (req.method == 'POST') {
          console.log(ip + "saved an image");

          req.on('data', function(chunk) {
                  req.content = (req.content ? req.content + chunk : chunk);
                  });

          req.on('end', function() {
                  // empty 200 OK response for now
                var info = JSON.parse(req.content.toString());
                var data = info.img.replace(/^data:image\/\w+;base64,/, "");
                var buf = new Buffer(data, 'base64');
                console.log(buf);
                fs.writeFile('images/premade/' + info.name.replace(/ /g, '_') + '.png', buf, function(){console.log('done saving ' + info.name);});
                res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                res.end();
              });
      }
      return;
  }
    try {
        var data = fs.readFileSync(__dirname + pathname);
    } catch(e) {
        notFoundError(e, req, res, pathname, ip);
        return;
    }
   //Get some info about the file
   var stats = fs.statSync(__dirname + pathname);
   var mtime = stats.mtime;
   var size = stats.size;

   //Get the if-modified-since header from the request
   var reqModDate = req.headers["if-modified-since"];

   //check if if-modified-since header is the same as the mtime of the file 
   if (reqModDate != null) {
       reqModDate = new Date(reqModDate);
       if(reqModDate.getTime() == mtime.getTime()) {
           //Yes: then send a 304 header without data (will be loaded by cache)
            console.log(ip + " got resource " + pathname + " from cache.");
           res.writeHead(304, {
                   "Last-Modified": mtime.toUTCString()
                   });

           res.end();
           return true;
       }
    }
     
   //NO: then send the headers and the file
    console.log(ip + " got resource " + pathname + " from server.");
   res.writeHead(200, {
           "Last-Modified": mtime.toUTCString(),
           "Content-Length": size
           });

   res.write(data);
   res.end();
   return;
}

function notFoundError(e, req, res, pathname, ip){
    console.log("ERROR -- " + e.path + " not found.  Referrer: " +  req.headers['referer'] + " User ip: " + ip);
    res.writeHead(404);
    data = fs.readFileSync(__dirname + '/notfound.html');
    res.end(data);
    return;
}

/* Unused function for getting cached stuff.  Contents put into main req handler
function getFromCache(pathName, request, response) {
    console.log(pathName);
    //Get the image from filesystem
    var img = fs.readFileSync(__dirname + pathName);

   //Get some info about the file
   var stats = fs.statSync(__dirname + pathName);
   var mtime = stats.mtime;
   var size = stats.size;

   //Get the if-modified-since header from the request
   var reqModDate = request.headers["if-modified-since"];

   //check if if-modified-since header is the same as the mtime of the file 
   if (reqModDate!=null) {
       reqModDate = new Date(reqModDate);
       if(reqModDate.getTime()==mtime.getTime()) {
           //Yes: then send a 304 header without data (will be loaded by cache)
           console.log("load from cache");
           response.writeHead(304, {
                   "Last-Modified": mtime.toUTCString()
                   });

           response.end();
           return true;
       }
    }
     
   //NO: then send the headers and the image
   console.log("no cache");
   response.writeHead(200, {
          // "Content-Type": "image/jpg",
           "Last-Modified": mtime.toUTCString(),
           "Content-Length": size
           });

   response.write(img);
   response.end();
   return true;
}
*/





io.sockets.on('connection', function (socket) {
	gamePrep(socket);
	//Sets up some extra info about the connections
	socket.plain = false; //User is capable of using fancy CSS
	socket.IPaddr = socket.handshake.address.address;
	socket.auth = "User";


	if (_.contains(blacklist, socket.IPaddr)){
		console.log("Blocked an attempted connection from " + socket.IPaddr);
		io.sockets.in('mod').emit('system', {message: "Blocked an attemped connection from " + socket.IPaddr});
		socket.emit('system', {message: "Sorry, you have been banned."});
		socket.disconnect(true);
		return(0);
	}
	console.log("New connection from " + socket.IPaddr);
	socket.emit('system', {message: welcomeMessage});

  socket.on('chat', function (data) {
    var oldName = socket.name;
	socket.name = data.name;
	if (oldName != socket.name)
		console.log(socket.IPaddr + " changed name from " + oldName + " to " + socket.name);

	if (cons.context.showChat)
		console.log(data.name + " : " + data.message);

	filterAndEnhance(data, socket);

	if (data.message[0] == '/')
		processSpecial(data, socket);
	else
		io.sockets.emit('chatReceived', data);

	var d = new Date;
	d.setUTCHours(d.getUTCHours() - 4) //Convert date to local time for me, at least

	fs.appendFile("log.txt", d.toISOString().slice(0,19) + " --  " + data.name + ":  " + data.message + "\n");
  });

  socket.on('disconnect', function() {
		var identifier = socket.name || socket.IPaddr;
		console.log(identifier + " has left chat.  Bye!");
		socket.broadcast.emit('system', {message: identifier + " has left chat.  Bye!"});
  });

  });

//Regex filtering for banned words, links, etc
function filterAndEnhance(data, socket) {
	if (!data.message) return;

	//Replaces sakuya is love
	data.message = data.message.replace(/Sakuya is love/i, "Sakuya is shit");

	//Makes links clickable
	data.message = data.message.replace(/(https?:\/\/[^ ]+) ?(.*)$/, "<a href='$1' target='_blank'>$1 </a>$2");

	//Removes extra CSS
	if (socket.plain)
		data.colour = data.colour.slice(0, data.colour.indexOf(';'));
}

//User commands
function processSpecial(data, socket) {
	//Special commands prefixed by /

	//Helper function to find the username and split it from the rest of the text
	//Maybe clean this up later since it's really bad
	function findName(data) {
		var i1 = data.message.indexOf('%')+1;
		var i2 = data.message.indexOf('%', i1);
		var targetName = data.message.slice(i1, i2);
		data.message = data.message.slice(i2+1);
		return targetName;
	}

	//PMs.  Syntax: /pm %name% message
	if (data.message.match(/^\/pm/)) {
		targetName = findName(data);
		var t = _.findWhere(io.sockets.clients(), {name: targetName});
			if (t){
				t.emit('pmReceived', data);
				socket.emit('pmReceived', data);
			}
	}

	if (socket.auth == "Mod") {
	console.log("Mod");
	//Extra commands for mods
		if (data.message.match(/^\/kick/)) {
			var targetName = findName(data);
			kick(targetName, data.message);
		}
		if (data.message.match(/^\/ban/)) {
			var targetName = findName(data);
			console.log(targetName);
			ban(targetName, data.message);
		}
		if (data.message.match(/^\/unban/)) {
			var targetName = findName(data);
			unban(targetName);
		}
		if (data.message.match(/^\/listBans/)) {
			socket.emit('system', {message: listBans()});
		}
		if (data.message.match(/^\/listUsers/)) {
			socket.emit('system', {message: _.pluck(listUsers(), 'name')});
		}
	}

}

//Server commands
var cons = repl.start({});

cons.context.say = say;
cons.context.plainify = plainify;
cons.context.kick = kick;
cons.context.ban = ban;
cons.context.unban = unban;
cons.context.listBans = listBans;
cons.context.setAuth = setAuth;
cons.context.listUsers = listUsers;
//cons.context.getCard = cards.getCard;
cons.context.showChat = false;


function say(message, target) {
//Say something.  Pass a username as second parameter to make it a PM.
	var data = {name: "SERVER",
				message: message,
				colour: "#FF0000; font-size:40px; font-weight:bold"};
	if (target == undefined) {
		io.sockets.emit('chatReceived', data);
	}
	else {
		var t = _.findWhere(io.sockets.clients(), {name: target});
		t.emit('pmReceived', data);
	}
}

function plainify(target){
//Removes fun css stuff from the target and lets them use only colour (or restores their ability)
	var t = _.findWhere(io.sockets.clients(), {name: target});
	if (t){
		t.plain = !t.plain;
		t.emit('system', {message: "Your fancy CSS privileges have been " + (t.plain ? "removed." : "restored.")});
		}
}

function kick(target, reason) {
//Kicks a user, though they can just reconnect if they want.
	var t = _.findWhere(io.sockets.clients(), {name: target});
	if (t){
		t.emit('system', {message: "You have been kicked.  " + (reason ? "Reason: " + reason : "")});
		t.broadcast.emit('system', {message: target + " has been kicked.  " + (reason ? "Reason: " + reason : "")});
		t.disconnect(true);
		}
}

function ban(target, reason) {
//Bans a user, they cannot reconnect until they are unbanned or the server is restarted (or they change IP)
	var clients = io.sockets.clients();
	var t = _.findWhere(clients, {name: target}) || _.findWhere(clients, {IPaddr: target});
	if (t){
		t.emit('system', {message: "You have been banned.  " + (reason ? "Reason: " + reason : "")});
		t.broadcast.emit('system', {message: target + " has been banned.  " + (reason ? "Reason: " + reason : "")});
		blacklist.push(t.IPaddr);
		console.log("Banned: " + t.IPaddr);
		t.disconnect(true);
		}
}

function unban(IP) {
//Unbans a user by entering their IP
	blacklist = _.without(blacklist, IP);
	console.log("Unbanned: " + IP);
}

function setAuth(target, level){
//Gives a specified level of auth to a user.  Currently, "User" and "Mod" exist.
	var t = _.findWhere(io.sockets.clients(), {name: target});
	if (t){
		t.auth = level;
		t.emit('system', {message: "You are now a " + level});
		if (level == "Mod")
			t.join("mod");
		else
			t.leave("mod");
	}
	console.log(target + " is now a " + level);
}

function listBans(){
	return blacklist;
}

function listUsers(){
	return _.map(io.sockets.clients(), function(d) {return _.pick(d, 'IPaddr', 'name');});
}
