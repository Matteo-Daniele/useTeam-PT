import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50, { message: 'Column name must be between 1 and 50 characters' })
  name: string;
  
  @IsString()
  @IsNotEmpty()
  boardId: string;
}
