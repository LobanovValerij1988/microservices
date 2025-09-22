import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@example.com",
      password: "password123",
    })
    .expect(201);
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@example.com",
      password: "password123",
    })
    .expect(200);
});

it("fails when a email that does not exist is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@nonexistent.com",
      password: "password123",
    })
    .expect(400);
});
it("fails when an incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@example.com",
      password: "wrongpassword",
    })
    .expect(400);
});

it("fails when invalid password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@example.com",
      password: "123456",
    })
    .expect(201);
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@example.com",
      password: "invalid",
    })
    .expect(400);
});
it("responds with a cookie when given valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@email.com",
      password: "password123",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@email.com",
      password: "password123",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
