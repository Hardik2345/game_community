// chat_service/listeners/userListener.js
const amqp = require('amqplib');
const User = require('../models/userModel'); // Corrected model path

const exchangeName = 'user_events';
const queueName = 'team_sync_queue';

async function listenForEvents() {
    try {
        const connection = await amqp.connect(process.env.EVENT_BUS_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(exchangeName, 'direct', { durable: true });
        const q = await channel.assertQueue(queueName, { durable: true });

        // Bind the queue to all relevant event types
        await channel.bindQueue(q.queue, exchangeName, 'UserUpdated');
        // NOTE: We only need UserUpdated from the auth service now.
        // The old UserCreated is handled by the logic inside the UserUpdated hook.

        console.log("👂 Waiting for User, Team, and Event update events...");

        channel.consume(q.queue, async (msg) => {
            if (msg.content) {
                const eventData = JSON.parse(msg.content.toString());
                const eventType = msg.fields.routingKey;
                console.log(`📥 Received ${eventType} event:`, eventData);
  
                await User.findByIdAndUpdate(eventData.userId, 
                { name: eventData.name, avatar: eventData.avatar }, { upsert: true });
                console.log(`✅ User data synced for: ${eventData.name}`);
                    
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('❌ Chat Service listener error', err);
    }
}

listenForEvents();