// auth_service/event-publisher.js
const { connectToBus } = require('./eventBus');

const exchangeName = 'user_events';

async function publishEvent(routingKey, data) {
  const channel = await connectToBus();
  await channel.assertExchange(exchangeName, 'direct', { durable: true });

  console.log('--- Preparing to publish this data:', JSON.stringify(data), '---');

  channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(JSON.stringify(data))
  );

  console.log(`✉️  Event published to exchange '${exchangeName}' with key '${routingKey}'`);
}

module.exports = { publishEvent };