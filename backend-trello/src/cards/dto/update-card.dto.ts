import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Card title must be between 1 and 100 characters' })
  title?: string;
  
  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Description must be less than 500 characters' })
  description?: string;
}
