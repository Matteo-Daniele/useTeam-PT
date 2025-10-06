import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Column name must be between 1 and 50 characters' })
  name?: string;
}
