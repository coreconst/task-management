import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../schemas/task.schema';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
