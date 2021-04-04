import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,inMemoryStatementsRepository)
  });

  it('should be able to create a statement', async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@email.com",
      name: "User Test",
      password: "1234"
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "Statement Test",
      type: OperationType.DEPOSIT
    })
    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(100)

  })

  it('should not be able to create a statement if user does not exists', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "1234",
        amount: 100,
        description: "Statement Test",
        type: OperationType.DEPOSIT
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  })

  it('should not be able to create a statement if user has insufficient funds', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "test@email.com",
        name: "User Test",
        password: "1234"
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 100,
        description: "Statement Test",
        type: OperationType.WITHDRAW
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);


  })

})
