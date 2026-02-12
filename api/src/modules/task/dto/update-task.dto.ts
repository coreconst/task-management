import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../schemas/task.schema';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
