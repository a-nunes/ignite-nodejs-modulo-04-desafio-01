import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import {OperationType} from "../../entities/Statement"


type IRequest = {
  receiver_id: string;
  id: string;
  amount: number;
  description: string;
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}
  async execute({amount,description,id,receiver_id}: IRequest): Promise<void> {
    const receiver = await this.usersRepository.findById(receiver_id);
    if(!receiver) {
      throw new AppError("Destination account does not exists")
    }
    const sender = await this.usersRepository.findById(id);
    if(!sender) {
      throw new AppError("Account does not exists");
    }

    if(!(await this.hasBalance(id, amount))) {
      throw new AppError("Insufficient balance.")
    }

    const withdrawFromSender = await this.statementsRepository.create({
      user_id: id,
      amount,
      description,
      type: OperationType.WITHDRAW
    })

    const depositToReceiver = await this.statementsRepository.create({
      user_id: receiver_id,
      amount,
      description,
      type: OperationType.DEPOSIT
    })
  }

  private async hasBalance(user_id: string, amount: number): Promise<boolean> {
    const currentBalance = await this.statementsRepository.getUserBalance({user_id})
    return (currentBalance.balance - amount) > 0 ? true : false

  }
}
