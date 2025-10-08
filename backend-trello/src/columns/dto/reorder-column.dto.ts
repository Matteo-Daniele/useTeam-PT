import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';

class ColumnOrderItemDto {
  @IsString()
  @IsNotEmpty()
  columnId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  order!: number;
}

export class ReorderColumnDto {
  @IsString()
  @IsNotEmpty()
  boardId: string;
  
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ColumnOrderItemDto)
  columnOrders!: ColumnOrderItemDto[];
}
