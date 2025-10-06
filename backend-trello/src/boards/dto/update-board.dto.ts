import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Board name must be between 3 and 50 characters' })
  name?: string;
  
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'Description must be less than 200 characters' })
  description?: string;
}
