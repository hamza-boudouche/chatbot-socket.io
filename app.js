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
const { addEvent, deleteEvent, getEvent } = require('./operations/events')

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"]
	}
});

const host = "https://af3a-41-92-125-87.ngrok.io"

const { addTask, modifyTask } = require("./operations/tasks")

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

app.put('/api/v1/calendar/:id', function (req, res) {
	res.json(
		{
			"summary": "Testing put",
			"location": "Tanger",
			"description": "Testing the put method",
			"participant": [
				"amalderouich00@gmail.com"
			]
		}
	)
})

app.get("/events/:startDate/:endDate", async (req, res) => {
	const startTime = await formatDate(req.params.startDate);
	const endTime = await formatDate(req.params.endDate);
	console.log(startTime, endTime)
	const url = `${host}/api/v1/calendar/${startTime}/${endTime}`
	console.log(url)
	const resp = await axios.get(url)
	res.json(resp.data)
})

app.post("/trello/addcards/:listId", async (req, res) => {
	// const info = req.body;
	// const url = `${host}/api/v1/trello/addcards/${req.params.listId}`
	// const resp = await axios.post(url, info)
	// res.json(resp.data)
	res.json({ ok: true })
})

app.delete("/trello/deletecard/:cardId", async (req, res) => {
	// const url = `${host}/api/v1/trello/deletecard/${req.params.cardId}`
	// const resp = await axios.delete(url)
	// res.json(resp.data)
	res.json({ ok: true })
})

app.get("/trello/alllists", async (req, res) => {
	// const url = `${host}/api/v1/trello/alllists`
	// const resp = await axios.get(url)
	// res.json(resp.data)
	console.log("call")
	res.json(
		[
			{
				"id": "623f95574962f689d267ade3",
				"name": "Test ajout Card",
				"cards": [
					{
						"id": "1",
						"name": "Test ajout Card",
						"desc": "this is a desc"
					},
					{
						"id": "2",
						"name": "Test ajout Card",
						"desc": "this is a desc"
					},
					{
						"id": "3",
						"name": "Test ajout Card",
						"desc": "this is a desc"
					},
				],
				"closed": false,
				"idBoard": "623f95574962f689d267ade2",
				"pos": 16384,
				"subscribed": false
			},
			{
				"id": "623f95574962f689d267ade4",
				"name": "Doing",
				"cards": [],
				"closed": false,
				"idBoard": "623f95574962f689d267ade2",
				"pos": 32768,
				"subscribed": false
			},
			{
				"id": "623f95574962f689d267ade5",
				"name": "Done",
				"cards": [],
				"closed": false,
				"idBoard": "623f95574962f689d267ade2",
				"pos": 49152,
				"subscribed": false
			}
		]
	)
})

const handleAddEventRequest = async (info) => {
	console.log(info)
	const startTime = await formatDate(info.startTime);
	const endTime = await formatDate(info.endTime);
	return {
		summary: info.title,
		location: info.location,
		description: info.description,
		startTime,
		endTime,
		participant: info.participant
	}
}

const handleModifyEventRequest = async (info) => {
	const startTime = await formatDate(info.startTime);
	const endTime = await formatDate(info.endTime);
	return {
		id: info.id,
		summary: info.title,
		location: info.location,
		description: info.description,
		startTime,
		endTime,
		participant: info.participant
	}
}

const handleDeleteEventRequest = async (info) => {
	/* const startTime = await formatDate(info.startTime);
	const endTime = await formatDate(info.endTime); */
	return {
		id: info.id
	}
}

const handleTrelloEventRequest = async (info) => {
	/* const startTime = await formatDate(info.startTime);
	const endTime = await formatDate(info.endTime); */
	return {
		name: info.name,
		desc: info.desc,
		listId: info.listId
	}
}

const handleTrelloAssignedRequest = async (info) => {
	return {
		idMember: info.idMember
	}
}

const handleAddCardRequest = async (info) => {
	return {
		name: info.name,
		idList: info.idList,
		desc: info.desc,
		url: info.url,
		due: info.due,
		dueComplete: info.dueComplete,
		idMembers: info.idMembers,
		labels: info.labels,
		badges: info.badges,
		checkItemStates: info.checkItemStates,
		closed: info.closed,
		dateLastActivity: info.dateLastActivity,
		idBoard: info.idBoard,
		idChecklists: info.idChecklists,
		idMembersVoted: info.idMembersVoted,
		idShort: info.idShort,
		idAttachmentCover: info.idAttachmentCover,
		manualCoverAttachment: info.manualCoverAttachment,
		pos: info.pos,
		shortLink: info.shortLink,
		shortUrl: info.shortUrl,
		subscribed: info.subscribed
	}
}

const handleModifyCardRequest = async (info) => {
	return {
		id: info.id,
		name: info.name,
		idList: info.idList,
		desc: info.desc,
		url: info.url,
		due: info.due,
		dueComplete: info.dueComplete,
		idMembers: info.idMembers,
		labels: info.labels,
		badges: info.badges,
		checkItemStates: info.checkItemStates,
		closed: info.closed,
		dateLastActivity: info.dateLastActivity,
		idBoard: info.idBoard,
		idChecklists: info.idChecklists,
		idMembersVoted: info.idMembersVoted,
		idShort: info.idShort,
		idAttachmentCover: info.idAttachmentCover,
		manualCoverAttachment: info.manualCoverAttachment,
		pos: info.pos,
		shortLink: info.shortLink,
		shortUrl: info.shortUrl,
		subscribed: info.subscribed
	}
}

const handleDeleteCardRequest = async (info) => {
	return {
		id: info.id,
	}
}

io.on('connection', async (socket) => {
	console.log('a user connected');
	socket.on('message', async (message) => {
		console.log(`message ${message} received from ${socket.request.user} with id ${socket.id}`);
		const response = await send(socket.request.user, message);
		socket.emit("reply", response)
	})
	socket.on('add_event', async (message) => {
		await send(socket.request.user, "/session_start");
		const info = await handleAddEventRequest(message)
		try {
			console.log(JSON.stringify({
				summary: info.summary,
				location: "Rabat",
				description: info.description,
				start: info.startTime,
				end: info.endTime,
				participant: [
					"hamzaboudouche@student.emi.ac.ma"
				]
			}, null, 2))
			console.log(`${host}/api/v1/calendar/`)
			const finalReq = await axios.post(`${host}/api/v1/calendar/`, {
				summary: info.summary,
				location: "Rabat",
				description: info.description,
				start: info.startTime,
				end: info.endTime,
				participant: [
					"hamzaboudouche@student.emi.ac.ma"
				]
			})

			socket.emit("reply", [{ text: "event added successfully" }])

		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('update_event', async (message) => {
		await send(socket.request.user, "/session_start");
		const info = await handleModifyEventRequest(message)
		try {
			console.log(`${host}/api/v1/calendar/${info.id}`)
			console.log({
				summary: info.summary,
				location: "Rabat",
				description: info.description,
				start: info.startTime,
				end: info.endTime,
				participant: [
					"hamzaboudouche@student.emi.ac.ma"
				]
			})
			const finalReq = await axios.put(`${host}/api/v1/calendar/${info.id}`, {
				summary: info.summary,
				location: "Rabat",
				description: info.description,
				start: info.startTime,
				end: info.endTime,
				participant: [
					"hamzaboudouche@student.emi.ac.ma"
				]
			})
			socket.emit("reply", [{ text: "event modified successfully" }])

		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('delete_event', async (message) => {
		await send(socket.request.user, "/session_start");
		const info = await handleDeleteEventRequest(message)
		try {
			const finalReq = await axios.delete(`${host}/api/v1/calendar/${info.id}`)
			socket.emit("reply", [{ text: "event deleted successfully" }])

		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('addCard', async (message) => {
		const info = await handleTrelloEventRequest(message)
		try {

			const finalReq = axios.post(`${host}/v2/trello/addcards/${info.listId}`, {
				name: info.name,
				desc: info.desc

			})
			socket.emit("reply", [{ text: "Card added successfully" }])
			await send(socket.request.user, "/session_start");
		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('modify_card', async (message) => {
		const info = await handleModifyCardRequest(message)
		try {
			const finalReq = await axios.put(`${host}/v2/trello/updateCard/${info.id}`, {
				id: info.id,
				name: info.name,
				idList: info.idList,
				desc: info.desc,
				url: info.url,
				due: info.due,
				dueComplete: info.dueComplete,
				idMembers: info.idMembers,
				labels: info.labels,
				badges: info.badges,
				checkItemStates: info.checkItemStates,
				closed: info.closed,
				dateLastActivity: info.dateLastActivity,
				idBoard: info.idBoard,
				idChecklists: info.idChecklists,
				idMembersVoted: info.idMembersVoted,
				idShort: info.idShort,
				idAttachmentCover: info.idAttachmentCover,
				manualCoverAttachment: info.manualCoverAttachment,
				pos: info.pos,
				shortLink: info.shortLink,
				shortUrl: info.shortUrl,
				subscribed: info.subscribed
			})
			socket.emit("reply", [{ text: "card modified successfully" }])
		} catch (error) {
			socket.emit("error", error)
		}
	})

	socket.on('delete_card', async (message) => {
		const info = await handleDeleteCardRequest(message)
		try {
			const finalReq = await axios.delete(`${host}/v2/trello/deletecard/${info.id}`, {
				id: info.id
			})
			socket.emit("reply", [{ text: "card deleted successfully" }])
		} catch (error) {
			socket.emit("error", error)
		}
	})
	socket.on('getAssignedTasks', async (message) => {
		const info = await handleTrelloAssignedRequest(message)
		try {
			const finalReq = await axios.get(`${host}/v2/trello/assignedTasks/${info.idMember}`, {
			})
			socket.emit("reply", [{ ...finalReq.data }])
			console.log(finalReq.data)
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
