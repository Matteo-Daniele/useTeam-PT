import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardsRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { GetBoardDto } from './dto/get-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private boardsRepository: BoardsRepository) {}
  
  // Crear un nuevo tablero
  async createBoard(createBoardDto: CreateBoardDto): Promise<GetBoardDto> {
    const board = await this.boardsRepository.create(createBoardDto);
    return this.mapToDto(board);
  }
  
  // Obtener todos los tableros
  async getAllBoards(): Promise<GetBoardDto[]> {
    const boards = await this.boardsRepository.findAll();
    return boards.map(board => this.mapToDto(board));
  }
  
  // Obtener un tablero específico
  async getById(id: string): Promise<GetBoardDto> {
    const board = await this.boardsRepository.findById(id);
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    
    return this.mapToDto(board);
  }
  
  // Actualizar tablero
  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<GetBoardDto> {
    const board = await this.boardsRepository.update(id, updateBoardDto);
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return this.mapToDto(board);
  }
  
  // Eliminar tablero
  async delete(id: string): Promise<void> {
    const deleted = await this.boardsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Board not found');
    }
  }
  
  // Método privado para mapear entidad a DTO
  private mapToDto(board: any): GetBoardDto {
    return {
      id: board._id.toString(),
      name: board.name,
      description: board.description,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    };
  }
}
