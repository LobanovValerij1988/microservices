import request from "supertest";
import { app } from "../../app";

it("get all tickets list", async () => {
  // create a ticket first
  await request(app).post("/api/tickets").set("Cookie", global.signup()).send({
    title: "some title",
    price: 20,
  });
  await request(app).post("/api/tickets").set("Cookie", global.signup()).send({
    title: "some title2",
    price: 21,
  });
  const response = await request(app).get("/api/tickets").send().expect(200);
  expect(response.body.length).toBe(2);
});
