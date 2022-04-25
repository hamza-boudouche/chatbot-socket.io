var amqp = require('amqplib');

const publish = async (exchange, topic, message) => {
	try {
		const connection = await amqp.connect("amqp://localhost");
		const channel = await connection.createChannel();
		await channel.assertExchange(exchange, 'topic', {
			durable: false
		});
		channel.publish(exchange, topic, Buffer.from(message));
		console.log(`msg sent: ${message} to topic ${topic}`);
		await connection.close();
	} catch (err) {
		throw err;
	}
}

const subscribe = async (exchange, topic, callback) => {
	try {
		const connection = await amqp.connect("amqp://localhost");
		const channel = await connection.createChannel();
		await channel.assertExchange(exchange, 'topic', {
			durable: false
		});
		const q = await channel.assertQueue('')
		await channel.bindQueue(q.queue, exchange, topic)
		await channel.consume(q.queue, callback, {
			noAck: true
		})
	} catch (error) {
		throw error;
	}
}
