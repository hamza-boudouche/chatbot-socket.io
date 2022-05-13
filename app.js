const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');
const { formatDate } = require("./format/dates")
const { send } = require("./communicate/rasa")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"]
	}
});

const jwtCheck = jwt({
	secret: jwks.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: 'https://dev--r9nce6d.us.auth0.com/.well-known/jwks.json'
	}),
	audience: 'https://smartassistant.com/',
	issuer: 'https://dev--r9nce6d.us.auth0.com/',
	algorithms: ['RS256']
});

const jwtUser = async (req, res, next) => {
	//const response = await axios.get(req.user.aud[1], { headers: { 'Authorization': req.headers.authorization } });
	req.user = "amal";
	next()
};

app.use(cors())
//app.use(jwtCheck);
app.use(jwtUser);

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

//io.use(wrap(jwtCheck));
io.use(wrap(jwtUser));

app.get('/api/external', function (req, res) {
	res.json(`You are ${req.user}`);
});

app.post('/api/v1/calendar', function (req, res) {
	res.json({
		"summary": "Testing",
		"location": "Rabat",
		"description": "Testing the post method",
		"start": "2022-04-22T18:14:00+00:00",
		"end": "2022-04-22T20:15:00+00:00",
		"participant": [
			"oussamabouzekraoui01@gmail.com",
			"oussamabouzekraoui01@gmail.com"
		]
	})
})

app.put('/api/v1/calendar/something/:id', function (req, res) {
	res.json({
    "summary":"Testing",
    "location":"Rabat",
    "description":"Testing the put method",
    "participant":[
        "oussamabouzekraoui01@gmail.com",
        "oussamabouzekraoui@student.emi.ac.ma"
    ]
  })
})

app.delete('/api/v1/calendar/something/:id', function (req, res) {
	res.json({
		"summary":"Testing",
		"location":"Rabat",
		"description":"Testing the delete method",
		"participant":[
			"oussamabouzekraoui01@gmail.com",
			"oussamabouzekraoui@student.emi.ac.ma"
		]
	  })
})

app.get('/api/v1/calendar/:start/:end', (req, res) => {
	res.json([
		{
			"attendees": [
				{
					"email": "oussamabouzekraoui01@gmail.com",
					"organizer": true,
					"responseStatus": "needsAction",
					"self": true
				},
				{
					"email": "oussamabouzekraoui@student.emi.ac.ma",
					"responseStatus": "needsAction"
				}
			],
			"created": {
				"value": 1648408504000,
				"dateOnly": false,
				"timeZoneShift": 0
			},
			"creator": {
				"email": "oussamabouzekraoui01@gmail.com",
				"self": true
			},
			"description": "Testing the put method",
			"end": {
				"dateTime": {
					"value": 1648335600000,
					"dateOnly": false,
					"timeZoneShift": 60
				},
				"timeZone": "Africa/Casablanca"
			},
			"etag": "\"3296817316392000\"",
			"htmlLink": "https://www.google.com/calendar/event?eid=YWZmbDlqcmpyMWZsOHFxMmhvdWxndG5udjggb3Vzc2FtYWJvdXpla3Jhb3VpMDFAbQ",
			"iCalUID": "affl9jrjr1fl8qq2houlgtnnv8@google.com",
			"id": "affl9jrjr1fl8qq2houlgtnnv8",
			"kind": "calendar#event",
			"location": "Rabat",
			"organizer": {
				"email": "oussamabouzekraoui01@gmail.com",
				"self": true
			},
			"reminders": {
				"useDefault": true
			},
			"sequence": 0,
			"start": {
				"dateTime": {
					"value": 1648332000000,
					"dateOnly": false,
					"timeZoneShift": 60
				},
				"timeZone": "Africa/Casablanca"
			},
			"status": "confirmed",
			"summary": "Testing",
			"updated": {
				"value": 1648408658196,
				"dateOnly": false,
				"timeZoneShift": 0
			},
			"eventType": "default"
		}
	])
})

const handleAddEventRequest = async (info) => {
	const startTime = await formatDate(info.startTime);
	const endTime = await formatDate(info.endTime);
	return {
		id: info.id,
		title: info.title,
		description: info.description,
		startTime,
		endTime
	}
}

io.on('connection', async (socket) => {
	console.log('a user connected');
	socket.on('message', async (message) => {
		console.log(`message ${message} received from ${socket.request.user} with id ${socket.id}`);
		const response = await send(socket.request.user,message);
		socket.emit("reply", response)
	})
	socket.on('add_event', async (message) => {
		const info = await handleAddEventRequest(message)
		try {
			const host = "http://localhost:5034"
			const finalReq = await axios.post(`${host}/api/v1/calendar`, {
				summary: info.title,
				location: "Rabat",
				description: info.description,
				start: info.startTime,
				end: info.endTime,
				participant: ["test@test.com"]
			})
			socket.emit("reply", [{ text: "event added successfully" }])
		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('modify_event', async (message) => {
		const info = await handleAddEventRequest(message)
		try {
			const host = "http://localhost:5034"
			const finalReq = await axios.put(`${host}/api/v1/calendar/something/${info.id}`, {
				summary: info.title,
				location: "Rabat",
				description: info.description,
				start: info.startTime,
				end: info.endTime,
				participant: ["test@test.com"]
			})
			socket.emit("reply", [{ text: "event modified successfully" }])
		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('delete_event', async (message) => {
		const info = await handleAddEventRequest(message)
		try {
			const host = "http://localhost:5034"
			const finalReq = await axios.delete(`${host}/api/v1/calendar/something/${info.id}`, {
				summary: info.title,
				location: "Rabat",
				description: info.description,
				start: info.startTime,
				end: info.endTime,
				participant: ["test@test.com"]
			})
			socket.emit("reply", [{ text: "event deleted successfully" }])
		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('disconnect', () => {
		console.log("user disconnected")
	})
});

server.listen(5034, () => {
	console.log('listening on *:5034');
});
