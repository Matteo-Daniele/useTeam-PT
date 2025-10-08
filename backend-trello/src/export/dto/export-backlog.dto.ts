import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class ExportBacklogDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsString()
  boardName?: string;
}
