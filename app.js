// node dependencies
var sys = require('sys');
var fs = require('fs');
// module dependencies
var express = require('./modules/express');
var ejs = require('./modules/ejs');

// config
var app = express.createServer();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.bodyDecoder());
app.use(express.cookieDecoder());
app.use(express.methodOverride());
app.use(express.staticProvider(__dirname + '/public'));

// vars

boardNames = [];
boards = {};

var initData = {"title": "foo", "modifier": "AN Other", "modified": "brand new!", "categories": ["Hot", "Not"], "cards": [{"name": "Paris", "categories": "Hot"}, {"name": "Paris Hilton", "categories": "Not"}]};

// functions

function clone(obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

// routes
app.get('/users', function(request, response){
	
	var usersRaw = fs.readFileSync(__dirname + '/data/users.json', 'utf8');
	var users = JSON.parse(usersRaw);
	
	response.render('users.ejs', {
		locals:{users:users}
	});
	
	fs.writeFile('./data/users.json', JSON.stringify(users), 'utf8', function(err){
		if (err) throw err;
		console.log('It saved');
	});
	
});

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

app.get('/boards/:id', function(req, res){
	console.log('getting UI for board ' + req.params.id);
	res.render('board.ejs', {
		locals:{board:boards[req.params.id], title:req.params.id, data:JSON.stringify(boards[req.params.id].data)}
	});
});

app.get('/boards/:id/json', function(req, res){
	console.log('getting JSON for board ' + req.params.id);
	res.send(boards[req.params.id].data);
});

app.put('/boards/:id/json', function(req, res){
	console.log('putting JSON for board ' + req.params.id);
	console.log(req.body.board);
	boards[req.params.id].data = eval('(' + req.body.board + ')');
	res.send('done');
});

app.del('/boards/:id', function(req, res){
	boardName = req.params.id;
	console.log('deleting ' + boardName);
	boards[boardName] = null;
	res.redirect('/boards');
});

app.listen(3000);
console.log('ready...');