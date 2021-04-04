import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;


describe('Authenticate User', () => {

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)

    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "test@email.com",
      password: "1234"
    });

  });

  it('should be able to Authenticate user if email and password are valids', async () => {


    const authenticatedUser = await authenticateUserUseCase.execute({
      email: "test@email.com",
      password: "1234"
    });

    expect(authenticatedUser).toHaveProperty("token")
  });

  it('should not be able to Authenticate if email is invalid', async () => {
    expect(async () => {
      const authenticatedUser = await authenticateUserUseCase.execute({
        email: "invalid@email.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it('should not be able to Authenticate if email is invalid', async () => {
    expect(async () => {
      const authenticatedUser = await authenticateUserUseCase.execute({
        email: "test@email.com",
        password: "invalid_password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });
})
