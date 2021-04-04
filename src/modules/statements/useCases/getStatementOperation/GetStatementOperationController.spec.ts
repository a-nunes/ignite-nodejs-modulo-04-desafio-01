import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
let user_id: string;
let token: string;
let statement_id: string;

describe('Create Statement Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()

    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "test@email.com",
      password: "1234"
    });

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "test@email.com",
      password: "1234"
    });

    token = tokenResponse.body.token;

    const statement = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "Deposito de 100 reais"
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    statement_id = statement.body.id;
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should be able to get a statement info', async () => {
      const response = await request(app).get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${token}`
      })

      expect(response.body.amount).toBe("100.00")
      expect(response.status).toBe(200)
  });

  it('should not be able to get statement of nonexistent user', async () => {
    const response = await request(app).get(`/api/v1/statements/${statement_id}`)
    .set({
      Authorization: `Bearer 1234`
    })

    expect(response.status).toBe(401)
  });

  it('should not be able to get statement of nonexistent statement', async () => {
    const response = await request(app).get(`/api/v1/statements/8b964ae9-6d34-432a-9d84-ac9e61195ac2`)
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(404)
  });
})
