import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository,inMemoryStatementsRepository)
  });

  it('should be able to get statement operation when using correct params', async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@email.com",
      name: "User Test",
      password: "1234"
    });

    const fakeStatement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      amount: 100,
      description: "Statement Test",
      type: OperationType.DEPOSIT
    });

    const statement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: fakeStatement.id as string
    })

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBe(100);
    expect(statement.type).toBe(OperationType.DEPOSIT)
  });

  it('should not be able to get statement if user does not exists', async () => {
    expect(async () => {
      const statement = await inMemoryStatementsRepository.create({
        user_id: "1234",
        amount: 100,
        description: "Statement Test",
        type: OperationType.DEPOSIT
      });

      await getStatementOperationUseCase.execute({
        user_id: "invalid_user_id",
        statement_id: statement.id as string
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it('should not be able to get statement if statement does not exists', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        email: "test@email.com",
        name: "User Test",
        password: "1234"
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "invalid_statement"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });

})
