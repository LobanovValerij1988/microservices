import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { TokenService } from "@ticketsproj/services";

declare global {
  var signup: (userId?: string) => string[];
}

let mongo: MongoMemoryServer;
jest.mock("../nats-wrapper");
beforeAll(async () => {
  process.env.JWT_KEY = "asdfghjkl";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signup = (userId = "idsdfgsdfg") => {
  const payload = {
    id: userId,
    email: "test@test.com",
  };
  const { jwt } = TokenService.generateToken(payload);
  const sessionJSON = JSON.stringify({ jwt });
  const base64 = Buffer.from(sessionJSON).toString("base64");
  return [`session=${base64}`];
};
