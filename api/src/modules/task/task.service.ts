import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';
import { ProjectService } from "../project/project.service";

@Injectable()
export class TaskService {
  constructor(
      @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
      private readonly projectService: ProjectService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskDocument> {
    await this.checkIsValidProjectId(createTaskDto.projectId);
    const payload = this.preparePayload(createTaskDto);

    const task = new this.taskModel(payload);
    return task.save();
  }

  async findById(id: string): Promise<TaskDocument | null> {
    return this.taskModel.findById(id).exec();
  }

  async findAll(query: FilterTasksDto = {}): Promise<TaskDocument[]> {
    const filter: Record<string, any> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.projectId) {
      if (!Types.ObjectId.isValid(query.projectId)) {
        throw new NotFoundException('Project not found');
      }
      filter.projectId = new Types.ObjectId(query.projectId);
    }

    if (query.createdFrom || query.createdTo) {
      const createdAt: Record<string, Date> = {};
      if (query.createdFrom) {
        const date = new Date(query.createdFrom);
        if (Number.isNaN(date.getTime())) {
          throw new BadRequestException('Invalid createdFrom date');
        }
        createdAt.$gte = date;
      }
      if (query.createdTo) {
        const date = new Date(query.createdTo);
        if (Number.isNaN(date.getTime())) {
          throw new BadRequestException('Invalid createdTo date');
        }
        createdAt.$lte = date;
      }
      filter.createdAt = createdAt;
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    return this.taskModel.find(filter).sort({ [sortBy]: sortOrder }).exec();
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDocument | null> {
    await this.checkIsValidProjectId(updateTaskDto.projectId);
    const payload = this.preparePayload(updateTaskDto);

    return this.taskModel.findByIdAndUpdate(id, payload, { returnDocument: 'after' }).exec();
  }

  async remove(id: string): Promise<TaskDocument | null> {
    return this.taskModel.findByIdAndDelete(id).exec();
  }

  private async checkIsValidProjectId(projectId?: string): Promise<void>
  {
    if (!projectId) {
      return;
    }

    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.projectService.findById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private preparePayload(payloadDto: CreateTaskDto|UpdateTaskDto): Record<string, any>
  {
    const payload = { ...payloadDto } as Record<string, any>;

    if (payloadDto.projectId) {
      payload.projectId = new Types.ObjectId(payloadDto.projectId);
    }

    return payload;
  }
}
