const axios = require('axios');
const qs = require('qs');


const formatDate = async (datTime) => {
	const reqStartTime = await axios.post("http://0.0.0.0:8000/parse", qs.stringify({
		'locale': 'en_GB',
		'text': datTime
	}), {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	})
	return reqStartTime.data[0].value.value;
}

module.exports = { formatDate }