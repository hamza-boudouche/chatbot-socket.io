const axios = require('axios');

const send = async (message) => {
	const resp = await axios.post("http://localhost:5005/webhooks/rest/webhook?token=secret", {
		"sender": socket.request.user,
		"message": message
	})
	return resp.data;
}

module.exports = { send }