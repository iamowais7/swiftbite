import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async (retries = 10, delay = 3000): Promise<void> => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL!);
      channel = await connection.createChannel();

      await channel.assertQueue(process.env.PAYMENT_QUEUE!, { durable: true });
      await channel.assertQueue(process.env.RIDER_QUEUE!, { durable: true });
      await channel.assertQueue(process.env.ORDER_READY_QUEUE!, { durable: true });

      console.log("✅ Connected to RabbitMQ (restaurant service)");

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
      });
      connection.on("close", () => {
        console.warn("RabbitMQ connection closed. Reconnecting...");
        setTimeout(() => connectRabbitMQ(), delay);
      });

      return;
    } catch (err: any) {
      console.error(`RabbitMQ connect attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw new Error("Could not connect to RabbitMQ after multiple retries.");
      }
    }
  }
};

export const getChannel = () => channel;
