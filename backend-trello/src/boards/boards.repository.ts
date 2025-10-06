import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board, BoardDocument } from './schemas/board.schema';

@Injectable()
export class BoardsRepository {
  constructor(@InjectModel(Board.name) private boardModel: Model<BoardDocument>) {}
  
  // Crear un nuevo tablero
  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = new this.boardModel({
      ...createBoardDto,
      userId
    });
    return await board.save();
  }
  
  // Buscar tablero por ID
  async findById(id: string, userId: string): Promise<Board | null> {
    return await this.boardModel.findOne({ _id: id, userId: userId });
  }
  
  // Buscar todos los tableros de un usuario
  async findByUserId(userId: string): Promise<Board[]> {
    return await this.boardModel.find({ userId }).sort({ createdAt: -1 });
  }
  
  // Actualizar tablero
  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board | null> {
    return await this.boardModel.findByIdAndUpdate(
      id, 
      updateBoardDto, 
      { new: true, runValidators: true }
    );
  }
  
  // Eliminar tablero
  async delete(id: string): Promise<boolean> {
    const result = await this.boardModel.findByIdAndDelete(id);
    return !!result;
  }
  
  // Verificar si el tablero pertenece al usuario
  async isOwner(boardId: string, userId: string): Promise<boolean> {
    const board = await this.boardModel.findOne({ _id: boardId, userId: userId });
    return !!board;
  }
}
