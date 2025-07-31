const amqp = require('amqplib');
const Wallet = require('../models/walletModel');
const User = require('../models/userModel'); // ✅ 1. Import your local lightweight user model

const exchangeName = 'user_events';
const queueName = 'monolith_user_sync_queue'; // Renamed for clarity

async function listenForEvents() {
  try {
    const connection = await amqp.connect(process.env.EVENT_BUS_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    const q = await channel.assertQueue(queueName, { durable: true });
    
    // ✅ 2. Bind the queue to both event types
    await channel.bindQueue(q.queue, exchangeName, 'UserCreated');
    await channel.bindQueue(q.queue, exchangeName, 'UserUpdated');

    console.log("👂 Monolith waiting for UserCreated and UserUpdated events...");

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        const eventData = JSON.parse(msg.content.toString());
        const eventType = msg.fields.routingKey;
        console.log(`📥 Monolith received ${eventType} event:`, eventData);

        // ✅ 3. Always sync the local user data using "upsert"
        await User.findByIdAndUpdate(
          eventData.userId,
          { name: eventData.name, role: eventData.role /* etc. */ },
          { upsert: true }
        );
        console.log(`✅ User data synced in monolith for: ${eventData.name}`);

        // ✅ 4. Only create a wallet if the event is 'UserCreated'
        if (eventType === 'UserCreated') {
          const existingWallet = await Wallet.findOne({ user: eventData.userId });
          if (!existingWallet) {
            await Wallet.create({ user: eventData.userId });
            console.log(`✅ Wallet created for user: ${eventData.userId}`);
          }
        }

        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (err) {
    console.error('❌ Monolith listener error', err);
  }
}

// Ensure you are calling this function. For example:
listenForEvents();