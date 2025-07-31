const amqp = require('amqplib');
let channel, connection;

async function connectToBus() {
  if (channel) return channel;
  try {
    connection = await amqp.connect(process.env.EVENT_BUS_URL);
    channel = await connection.createChannel();
    console.log('✅ Connected to RabbitMQ in auth_service');
    return channel;
  } catch (err) {
    console.error('❌ Failed to connect to RabbitMQ', err);
  }
}

module.exports = { connectToBus };