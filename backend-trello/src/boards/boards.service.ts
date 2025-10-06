import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BoardsRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { GetBoardDto } from './dto/get-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private boardsRepository: BoardsRepository) {}
  
  // Crear un nuevo tablero
  async createBoard(
    createBoardDto: CreateBoardDto,
    userId: string,
  ): Promise<GetBoardDto> {
    // Lógica de negocio: validar que el usuario no tenga demasiados tableros
    const userBoards = await this.boardsRepository.findByUserId(userId);
    if (userBoards.length >= 10) {
      throw new ForbiddenException('Maximum 10 boards allowed per user');
    }
    
    // Lógica de negocio: verificar que el nombre no esté duplicado
    const existingBoard = userBoards.find((board) => 
      board.name.toLowerCase() === createBoardDto.name.toLowerCase()
    );
    if (existingBoard) {
      throw new ForbiddenException('Board name already exists');
    }
    
    const board = await this.boardsRepository.create(createBoardDto, userId);
    return this.mapToDto(board);
  }
  
  // Obtener todos los tableros del usuario
  async getUserBoards(userId: string): Promise<GetBoardDto[]> {
    const boards = await this.boardsRepository.findByUserId(userId);
    return boards.map(board => this.mapToDto(board));
  }
  
  // Obtener un tablero específico
  async getById(id: string, userId: string): Promise<GetBoardDto> {
    const board = await this.boardsRepository.findById(id, userId);
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    
    // Verificar que el usuario sea el propietario
    if (!await this.boardsRepository.isOwner(id, userId)) {
      throw new ForbiddenException('You do not have access to this board');
    }
    
    return this.mapToDto(board);
  }
  
  // Actualizar tablero
  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string): Promise<GetBoardDto> {
    // Verificar que el tablero existe y pertenece al usuario
    await this.getById(id, userId);

    const board = await this.boardsRepository.update(id, updateBoardDto);
    return this.mapToDto(board);
  }
  
  // Eliminar tablero
  async delete(id: string, userId: string): Promise<void> {
    // Verificar que el tablero existe y pertenece al usuario
    await this.getById(id, userId);
    
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
      userId: board.userId,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    };
  }
}
