require('dotenv').config();
const bodyparser = require('body-parser');
const validUrl = require('is-url');
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//I mean... could be real DB but lets just call this ad-hoc in-memory db
let urls = [];

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res, next) {
	const url = req.body.url

	if(!validUrl(url)) {
		res.json({error: "invalid url"});
		return;
	}

	urls.push(url);
	res.json({original_url: url, short_url: urls.indexOf(url)})
});

app.get("/api/shorturl", function(req, res, next) {
	res.json({status: "ok"})
});

app.get("/api/shorturl/:shorturl", function(req, res, next) {
	res.redirect(urls[parseInt(req.params.shorturl)]);
});

app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});
