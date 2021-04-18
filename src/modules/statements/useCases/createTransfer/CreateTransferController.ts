import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";


export class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const {receiver_id} = request.params;
    const {id} = request.user;
    const {amount, description} = request.body

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    await createTransferUseCase.execute({receiver_id: receiver_id, id, amount, description})

    return response.status(201).json({message: "Transfer has been made."})

  }
}
