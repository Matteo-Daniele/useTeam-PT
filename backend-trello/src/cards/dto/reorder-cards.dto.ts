import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class CardOrderItemDto {
  @IsString()
  @IsNotEmpty()
  cardId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  order!: number;
}

export class ReorderCardsDto {
  @IsString()
  @IsNotEmpty()
  columnId!: string;

  @IsString()
  @IsNotEmpty()
  boardId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CardOrderItemDto)
  cardOrders!: CardOrderItemDto[];
}


