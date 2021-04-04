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
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to register a deposit', async () => {
      const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposito de 100 reais"
      })
      .set({
        Authorization: `Bearer ${token}`
      })
      expect(response.body).toHaveProperty("id")
      expect(response.body.amount).toBe(100)
      expect(response.status).toBe(201)
  });

  it('should be able to register a withdraw', async () => {
    await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposito de 100 reais"
      })
      .set({
        Authorization: `Bearer ${token}`
      })

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 50,
      description: "Saque de 50 reais"
    })
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(response.body).toHaveProperty("id")
    expect(response.body.amount).toBe(50)
    expect(response.status).toBe(201)
  });

  it('should not be able to register a withdraw with insufficient funds', async () => {

    const poorUser = await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "poor@user.com",
      password: "1234"
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "poor@user.com",
      password: "1234"
    });

    const poorToken = tokenResponse.body.token;

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 100,
      description: "Saque de 100 reais"
    })
    .set({
      Authorization: `Bearer ${poorToken}`
    })
    expect(response.status).toBe(400)
  });
})
