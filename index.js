const express = require('express')
const app = express()
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
});

const UserModel = mongoose.model('User', new mongoose.Schema({ username: { type: String, required: true } }));
const ExerciseModel = mongoose.model('Exercise', new mongoose.Schema({
	username: String,
	description: String,
	duration: Number,
	date: Date
}));

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/api/users", function(req, res, next) {

});

app.post("/api/users", async function(req, res, next) {
	let user = req.body.username;

	await UserModel.create({username: user})

	UserModel.find({username: user}).select("username _id").exec(function(err, data) {
		if(err) {
			res.json({"error": "user not found"})
			return;
		}

		res.json({"username": data.username, "_id": data._id});
	})
});

app.post("/api/users/:_id/exercises", function(req, res, next) {

});

app.get("/api/users/:_id/logs", function(req, res, next) {

});

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log('Your app is listening on port ' + listener.address().port)
})
