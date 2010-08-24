// node dependencies
var sys = require('sys');
var fs = require('fs');

// module dependencies
// filesystem references are post correct after running ndistro
var express = require('./modules/express');
var ejs = require('./modules/ejs');

// config
var app = express.createServer();
app.use(express.staticProvider(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Here we use the bodyDecoder middleware
// to parse urlencoded request bodies
// which populates req.body
app.use(express.bodyDecoder());

// Required by session
app.use(express.cookieDecoder());

// The methodOverride middleware allows us
// to set a hidden input of _method to an arbitrary
// HTTP method to support app.put(), app.del() etc
app.use(express.methodOverride());

// vars
boardNames = [];
boards = {};
initData = {"title": "foo", "modifier": "AN Other", "modified": "brand new!", "categories": ["Hot", "Not"], "cards": [{"name": "Paris", "categories": "Hot"}, {"name": "Paris Hilton", "categories": "Not"}]};
// timeout = 30000;
port = 3000;

// functions
function clone(obj){
    if(obj == null || typeof(obj) != 'object') {
	    return obj;
	}
    var temp = obj.constructor(); // changed

    for(var key in obj) {
	    temp[key] = clone(obj[key]);
	}
    return temp;
}

// Flush the boards json data from memory to the file system.
function persistData(file, json){
	fs.writeFile(file, JSON.stringify(json), 'utf8', function(err){
		if (err) { throw err; }
		console.log('Saved data to ' + file);
	});
}


// Load the stashed json data into memory.
function read(){
	boards = JSON.parse(fs.readFileSync(__dirname + '/data/boards.json', 'utf8'));
	boardNames = JSON.parse(fs.readFileSync(__dirname + '/data/boardNames.json', 'utf8'));
	
	console.log('reading boards data');
	console.log(JSON.stringify(boards));
	console.log(JSON.stringify(boardNames));
}


// routes
app.get('/', function(req, res){
	console.log('displaying homepage');
	res.render('index.ejs');
});

app.get('/boards', function(req, res){
	console.log('displaying boards');
	res.render('boards.ejs', {
		locals:{boards:boardNames}
	});
});


app.post('/boards', function(req, res){
	var boardName = req.body.name;	
	var board = boards[boardName];
	if (undefined === board || null === board){
		console.log('creating new board ' + boardName);
		boardNames.push({"name":boardName});
		var data = clone(initData);
		data["title"] = boardName;
		boards[boardName] = {"name":boardName, "data":data};
	} else {
		throw new Error('board already exists');
	}
	res.redirect('/boards/' + boardName);
});


// Deliver a board UI and include the initial data.
app.get('/boards/:id', function(req, res){
	console.log('getting UI for board ' + req.params.id);
	res.render('board.ejs', {
		locals:{board:boards[req.params.id], title:req.params.id, data:JSON.stringify(boards[req.params.id].data)}
	});
});


// Deliver the json data for a board.
app.get('/boards/:id/json', function(req, res){
	console.log('getting JSON for board ' + req.params.id);
	res.send(boards[req.params.id].data);
});


// Consume a blob of json, keep it in memory and also stash it on the disk.
app.put('/boards/:id/json', function(req, res){
	console.log('putting JSON for board ' + req.params.id);
	console.log(req.body.board);
	boards[req.params.id].data = eval('(' + req.body.board + ')');
	persistData("./data/boards.json", boards);
	persistData("./data/boardNames.json", boardNames);
	res.send('done');
});


// Delete a board from the data store.
app.del('/boards/:id', function(req, res){
	boardName = req.params.id;
	console.log('deleting ' + boardName);
	boards[boardName] = null;
	res.redirect('/boards');
});


// let's get started.
read();
app.listen(port);
console.log('Listening on port ' + port);