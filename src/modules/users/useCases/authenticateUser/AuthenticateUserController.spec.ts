import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe('Authenticate User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to authenticate a user with correct params', async () => {
    const user = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "test@email.com",
      password: "1234"
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234"
    })

    expect(tokenResponse.body).toHaveProperty("token")
    expect(tokenResponse.status).toBe(200)
  });

  it('should not be able to authenticate user with incorrect email', async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "invalid@email.com",
      password: "1234"
    })

    expect(tokenResponse.status).toBe(401)
  });

  it('should not be able to authenticate user with incorrect password', async () => {
    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "invalid_password"
    })

    expect(tokenResponse.status).toBe(401)
  });
})
