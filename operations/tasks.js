const { formatDate } = require("../format/dates")
const axios = require("axios")

const addTask = async ({ title, description, startTime, endTime, participants }) => {
	try {
		const startTimeISO = await formatDate(startTime)
		const endTimeISO = await formatDate(endTime)
		const host = "http://b50e-105-67-1-1.ngrok.io"
		const res = await axios.post(`${host}/api/v1/calendar`, {
			summary: title,
			location: "Rabat",
			description: description,
			start: startTimeISO,
			end: endTimeISO,
			participant: participants,
		})

	} catch (error) {
		return {}
	}
}

const modifyTask = async ({ title, description, startTime, endTime, participants }) => {
	try {
		// const startTimeISO = await formatDate(startTime)
		// const endTimeISO = await formatDate(endTime)
		const host = "http://b50e-105-67-1-1.ngrok.io"
		const res = await axios.put(`${host}/api/v1/calendar/${info.id}`, {
			summary: info.title,
			location: info.location,
			description: info.description,
			participant: info.participant
		})

	} catch (error) {
		return {}
	}
}

module.exports={
	addTask,
	modifyTask
}