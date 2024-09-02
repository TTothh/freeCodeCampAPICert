const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

const conn = mongoose.createConnection(process.env.MONGODB_URL);
conn.on('connected', () => console.log('connected'));

const UserModel = conn.model('User', new mongoose.Schema({
	username: {
		type: String,
		required: true
	}
}));

const ExerciseModel = conn.model('Exercise', new mongoose.Schema({
	username: String,
	description: String,
	duration: Number,
	date: String,
	id: String
}));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/api/users", function(req, res, next) {
	UserModel.find().select(["username", "_id"]).then((data) => {
		res.json(data);
	}).catch((err) => {
		console.error(err);
		res.json({"error": "user not found"});
		return;
	});
});

app.post("/api/users", async function(req, res, next) {
	let user = req.body.username;

	await UserModel.create({username: user});

	await UserModel.findOne({username: user}).select(["username", "_id"]).then((data) => {
		res.json({"username": data.username, "_id": data._id});
	}).catch((err) => {
		console.error(err)
		res.json({"error": "user not found"});
		return;
	});
});

app.post("/api/users/:_id/exercises", async function(req, res, next) {
	let id = req.body[":_id"];
	let date = ((!req.body.date) ? new Date().toDateString() : new Date(req.body.date).toDateString());
	let user = "";

	await UserModel.findOne({"_id": id}).select("username").exec().then((data) => {
		user = data.username;
	}).catch((err) => {
		console.error(err);
		res.json({"error": "user not found"});
		return;
	});

	await ExerciseModel.create({
		username: user,
		description: req.body.description,
		duration: req.body.duration,
		date: date,
		id: id
	});


	res.json({
		"_id": id,
		"username": user,
		"date": date,
		"duration": req.body.duration,
		"description": req.body.description
	})
});

app.get("/api/users/:_id/logs", async function(req, res, next) {
	let from = new Date(req.params.from);
	let to = new Date(req.params.to);
	let limit = req.params.limit;

	let user = "";
	let id = req.params["_id"];
	let exercises = [];

	await UserModel.findOne({"_id": id}).then((data) => {
		user = data.username;
	}).catch((err) => {
		console.error(err)
		res.json({"error": "user not found"});
		return;
	});

	await ExerciseModel.find({"id": id}).select(["description", "duration", "date"]).then((data) => {
		if(Date.parse(from) && !Date.parse(to)) {
			console.log(data)
			exercises = data.filter((exercise) => new Date(exercise.date) >= from);
		} else if(Date.parse(from) && Date.parse(to)) {
			console.log(data)
			exercises = data.filter((exercise) => new Date(exercise.date) >= from && new Date(exercise.date) <= to);
		} else {
			exercises = data;
		}
	}).catch((err) => {
		console.error(err);
		res.json({"error": "user not found"});
		return;
	});

	res.json({
		"_id": id,
		"username": user,
		"count": exercises.length,
		"log": (!limit) ? exercises : exercises.slice(0, limit)
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
