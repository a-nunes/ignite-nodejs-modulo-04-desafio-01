import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
let user;
let token: string;

describe('Create Statement Controller', () => {

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

    await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "Deposito de 100 reais"
    })
    .set({
      Authorization: `Bearer ${token}`
    })
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to get balance of authenticated user', async () => {
      const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })

      expect(response.body.balance).toBe(100)
      expect(response.status).toBe(200)
  });

  it('should not be able to get balance of nonexistent user', async () => {
    const response = await request(app).get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer 1234`
    })

    expect(response.status).toBe(401)
});
})
