import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
let user;
let token: string;

describe('Show User Profile Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()

    user = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "test@email.com",
      password: "1234"
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234"
    });

    token = tokenResponse.body.token;
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to show user profile', async () => {
      const response = await request(app).get("/api/v1/profile").set({
        Authorization: `Bearer ${token}`
      })
      expect(response.body).toHaveProperty("id")
      expect(response.status).toBe(200)
  });

  it('should not be able to show profile if user does not exists', async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer 1234`
    })

    expect(response.status).toBe(401)
  });
})
