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

mongoose.createConnection(env.MONGODB_URL);

const UserModel = mongoose.model('User', new mongoose.Schema({ username: { type: String, required: true } }));
const ExerciseModel = mongoose.model('Exercise', new mongoose.Schema({
	username: String,
	description: String,
	duration: Number,
	date: String,
	id: String
}));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/api/users", function(req, res, next) {
	UserModel.find().select("username, _id").exec((err, data) => {
		if(err) {
			res.json({"error": "user not found"});
			return;
		}

		res.json({data});
	});
});

app.post("/api/users", async function(req, res, next) {
	let user = req.body.username;

	await UserModel.create({username: user});

	UserModel.find({username: user}).select("username _id").exec((err, data) => {
		if(err) {
			res.json({"error": "user not found"});
			return;
		}

		res.json({"username": data.username, "_id": data._id});
	});
});

app.post("/api/users/:_id/exercises", async function(req, res, next) {
	let id = req.body._id;
	let user = {}
	let exercise = {}

	await ExerciseModel.create({
		username: req.body.username,
		description: req.body.description,
		duration: req.body.duration,
		date: ((!req.body.date) ? new Date().toDateString() : req.body.date.toDateString()),
		id: req.body._id
	});

	await UserModel.find({"id": id}).exec((err, data) => {
		if(err) {
			res.json({"error": "user not found"});
			return;
		}

		user = data;
	});

	res.json({
		"username": user.username,
		"description": req.body.description,
		"duration": req.body.duration,
		"date": req.body.date.toDateString(),
		"_id": id
	})
});

app.get("/api/users/:_id/logs", async function(req, res, next) {
	let from = new Date(req.params.from);
	let to = new Date(req.params.to);
	let limit = req.params.limit;

	let user = "";
	let id = req.params._id;
	let exercises = [];

	await UserModel.find({"id": req.params._id}).exec((err, data) => {
		if(err) {
			res.json({"error": "user not found"});
			return;
		}

		user = data.username;
	});

	await ExerciseModel.find({"id": id}).select("description duration date").exec((err, data) => {
		if(err) {
			res.json({"error": "user not found"});
			return;
		}

		if(from && !to) {
			exercises = data.filter((exercise) => new Date(exercise.date) >= from);
		} else if(from && to) {
			exercises = data.filter((exercise) => new Date(exercise.date) >= from && new Date(exercise.date) <= to);
		} else {
			exercises = data;
		}
	});

	res.json({
		"username": user,
		"count": exercises.length,
		"_id": id,
		"log": [(!limit) ? exercises : exercises.slice(0, limit)]
	});
});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
