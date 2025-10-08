import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  cardId: string;
  
  @IsString()
  @IsNotEmpty()
  toColumnId: string;
  
  @IsString()
  @IsNotEmpty()
  boardId: string;
  
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  newOrder: number;
}
