var express = require('express');
const multer  = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' })
const bodyparser = require('body-parser');
var cors = require('cors');
require('dotenv').config()

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/fileanalyse", upload.single('upfile'), (req, res, next) => {
	let file = req.file;

	let fName = file.originalname;
	let fMime = file.mimetype;
	let fSize = file.size;

	fs.unlink(file.path, (err) => {
		if (err) {
		  console.error(`Error removing file: ${err}`);
		  return;
		}
	});

	res.json({
		"name": fName,
		"type": fMime,
		"size": fSize
	});
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log('Your app is listening on port ' + port)
});
