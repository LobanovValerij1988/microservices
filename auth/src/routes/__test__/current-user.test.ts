import request from "supertest";
import { app } from "../../app";

it("returns a current user", async () => {
  const email = "test@test.com";
  const password = "password";
  const cookie = await global.signup(email, password);
  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", cookie)
    .send()
    .expect(400);
  expect(response.body.currentUser.email).toEqual(email);
  expect(response.body.currentUser.id).toBeDefined();
});

it("returns null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/current-user")
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
});
