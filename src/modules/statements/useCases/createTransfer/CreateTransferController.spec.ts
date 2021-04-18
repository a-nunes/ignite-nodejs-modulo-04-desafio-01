import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { User } from "../../../users/entities/User";

let connection: Connection;
let sender;
let receiver: User;
let token: string;

describe('Create Transfer Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations()

    const senderResponse = await request(app).post("/api/v1/users").send({
      name: "Sender User",
      email: "sender@email.com",
      password: "1234"
    });

    sender = senderResponse.body;


    const receiverResponse = await request(app).post("/api/v1/users").send({
      name: "Receiver User",
      email: "receiver@email.com",
      password: "1234"
    });

    receiver = receiverResponse.body

    const tokenResponse = await request(app).post("/api/v1/sessions").send({
      email: "sender@email.com",
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

  it('should be able to transfer to a existent user', async () => {
      const response = await request(app).post(`/api/v1/statements/transfer/${receiver.id}`)
      .send({
        amount: 50,
        description: "test"
      })
      .set({
        Authorization: `Bearer ${token}`
      })

      const balance = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`
      })

    expect(balance.body.balance).toBe(50)
      expect(response.status).toBe(201)
  });

  it('should not be able to transfer to a nonexistent user', async () => {
    const response = await request(app).post(`/api/v1/statements/transfer/1337fab1-7945-49ce-81d1-79b9da664cb5`)
    .send({
      amount: 50,
      description: "test"
    })
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(400)
});
it('should not be able to transfer from a nonexistent user', async () => {
  const response = await request(app).post(`/api/v1/statements/transfer/${receiver.id}`)
  .send({
    amount: 50,
    description: "test"
  })
  .set({
    Authorization: `Bearer 1234`
  })

  expect(response.status).toBe(401)
});
it('should not be able to transfer with no balance', async () => {
  const response = await request(app).post(`/api/v1/statements/transfer/${receiver.id}`)
  .send({
    amount: 150,
    description: "test"
  })
  .set({
    Authorization: `Bearer ${token}`
  })

  expect(response.status).toBe(400)
});
})
