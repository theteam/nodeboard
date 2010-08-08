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

// functions
function clone(obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

function flush(){
	fs.writeFile('./data/boards.json', JSON.stringify(boards), 'utf8', function(err){
		if (err) throw err;
		console.log('It saved');
	});
	fs.writeFile('./data/boardNames.json', JSON.stringify(boardNames), 'utf8', function(err){
		if (err) throw err;
		console.log('It saved');
	});
	
	setTimeout(flush, 3000);
}

function read(){
	boards = JSON.parse(fs.readFileSync(__dirname + '/data/boards.json', 'utf8'));
	boardNames = JSON.parse(fs.readFileSync(__dirname + '/data/boardNames.json', 'utf8'));
	
	console.log('reading boards data');
	console.log(JSON.stringify(boards));
	console.log(JSON.stringify(boardNames));
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

read();
setTimeout(flush,3000);

app.listen(3000);
console.log('ready...');