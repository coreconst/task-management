import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../schemas/task.schema';

export class FilterTasksDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  createdFrom?: string;

  @IsString()
  @IsOptional()
  createdTo?: string;

  @IsIn(['status', 'createdAt', 'projectId'])
  @IsOptional()
  sortBy?: 'status' | 'createdAt' | 'projectId';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
