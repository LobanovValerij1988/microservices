import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticked-created-publisher";
console.clear();
const stan = nats.connect("ticketing", "abc", {
  url: "http://nats-service:4222",
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");
  try {
    await new TicketCreatedPublisher(stan).publish({
      id: "123",
      title: "concert",
      price: 20,
    });
  } catch (err) {
    console.error(err);
  }
});
