const { formatDate } = require("../format/dates")
const axios = require("axios")
const host = "http://b50e-105-67-1-1.ngrok.io"

const addEvent = async ({ title, description, startTime, endTime, participants }) => {
	try {
		const startTimeISO = await formatDate(startTime)
		const endTimeISO = await formatDate(endTime)
		const res = await axios.post(`${host}/api/v1/calendar`, {
			summary: title,
			location: "Rabat",
			description: description,
			start: startTimeISO,
			end: endTimeISO,
			participant: participants,
		})
		return { success: true, reply: "task added successfully" }
	} catch (error) {
		return { success: false, error: error }
	}
}

const deleteEvent = async ({ startTime, endTime }) => {
	try {
		const startTimeISO = await formatDate(startTime)
		const endTimeISO = await formatDate(endTime)
		const res = await axios.delete(`${host}/api/v1/calendar/${startTimeISO}/${endTimeISO}`)
		return { success: true, reply: "task deleted successfully" }
	} catch (error) {
		return { success: false, error: error }
	}
}

const getEvent = async ({ startTime, endTime }) => {
	try {
		const startTimeISO = await formatDate(startTime)
		const endTimeISO = await formatDate(endTime)
		const res = await axios.get(`${host}/api/v1/calendar/${startTimeISO}/${endTimeISO}`)
		return { success: true, reply: "here are all the tasks you asked for: ", tasks: res.data }
	} catch (error) {
		return { success: false, error: error }
	}
}

module.exports = { addEvent, deleteEvent, getEvent }