const axios = require('axios');

<<<<<<< HEAD
const send = async (user, message) => {
=======
const send = async (user,message) => {
>>>>>>> 90daf0a22babd1465d0e0456dac759db26b9b30a
	const resp = await axios.post("http://localhost:5005/webhooks/rest/webhook?token=secret", {
		"sender": user,
		"message": message
	})
	return resp.data;
}

module.exports = { send }