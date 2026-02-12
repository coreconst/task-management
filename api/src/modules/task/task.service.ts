import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
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

  async findAll(): Promise<TaskDocument[]> {
    return this.taskModel.find().exec();
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
