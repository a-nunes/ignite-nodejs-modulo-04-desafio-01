import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to create a user', async () => {
    const fakeUser = await createUserUseCase.execute({
      name: "User Test",
      email: "test@user.com",
      password: "1234"
    })

    expect(fakeUser).toHaveProperty("id")
  });

  it('should not be able to create user if email already exists', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Test 1",
        email: "repeated@email.com",
        password: "1234"
      })

      await createUserUseCase.execute({
        name: "User Test 2",
        email: "repeated@email.com",
        password: "1234"
      })
    }).rejects.toBeInstanceOf(CreateUserError)

  });
})
