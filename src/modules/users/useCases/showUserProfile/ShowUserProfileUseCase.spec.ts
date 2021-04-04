import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Show User Profile', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it('should be able to show a user profile', async () => {
    const fakeUser = await inMemoryUsersRepository.create({
      name: "User test",
      email: "test@usertest.com",
      password: "1234"
    })

    const user = await showUserProfileUseCase.execute(fakeUser.id as string);

    expect(user.id).toBe(fakeUser.id)
  });

  it('should throw if user does not exists', async () => {
    expect(async () => {
      const fakeUser = {
        id: "123"
      }
        const user = await showUserProfileUseCase.execute(fakeUser.id as string);
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  });
})
