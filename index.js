require('dotenv').config();
var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/whoami', function (req, res) {
	console.log(req.headers)
	res.json({
		"ipaddress": req.headers['x-forwarded-for'],
		"language": req.headers['accept-language'],
		"software": req.headers['user-agent']
	});
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
	console.log('Your app is listening on port ' + listener.address().port);
});
