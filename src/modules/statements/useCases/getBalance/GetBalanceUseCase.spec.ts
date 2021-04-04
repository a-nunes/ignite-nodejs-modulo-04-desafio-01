import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Get Balance', () => {

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  });

  it('should be able to get balance if user exists', async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@email.com",
      name: "User Test",
      password: "1234"
    })

    const balance = await getBalanceUseCase.execute({user_id: user.id as string})

    expect(balance).toHaveProperty("balance")
    expect(balance).toHaveProperty("statement")
  });

  it('should not be able to get balance if user does not exists', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({user_id: "invalid_user_id"})
    }).rejects.toBeInstanceOf(GetBalanceError)
  });
})
