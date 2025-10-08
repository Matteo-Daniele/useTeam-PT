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
  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = new this.boardModel(createBoardDto);
    return await board.save();
  }
  
  // Buscar tablero por ID
  async findById(id: string): Promise<Board | null> {
    return await this.boardModel.findById(id);
  }
  
  // Buscar todos los tableros
  async findAll(): Promise<Board[]> {
    return await this.boardModel.find().sort({ createdAt: -1 });
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
}
