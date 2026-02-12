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
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      return null;
    }

    const withProjectName = await this.attachProjectName([task]);
    return withProjectName[0] ?? task;
  }

  async findAll(query: FilterTasksDto = {}): Promise<TaskDocument[]> {
    const filter: Record<string, any> = {};

    if (query.status) {
      filter.status = query.status;
    }

    const projectId = query.projectId?.trim();
    if (projectId) {
      if (!Types.ObjectId.isValid(projectId)) {
        throw new NotFoundException('Project not found');
      }
      filter.projectId = new Types.ObjectId(projectId);
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

    const tasks = await this.taskModel
      .find(filter)
      .sort({ [sortBy]: sortOrder })
      .exec();

    return this.attachProjectName(tasks);
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
    if (!projectId || projectId.trim() === '') {
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

    if (payloadDto.projectId && payloadDto.projectId.trim() !== '') {
      payload.projectId = new Types.ObjectId(payloadDto.projectId);
    } else {
      delete payload.projectId;
    }

    return payload;
  }

  private async attachProjectName(tasks: TaskDocument[]) {
    const projectIds = tasks
      .map((task) => task.projectId)
      .filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);

    if (projectIds.length === 0) {
      return tasks;
    }

    const projects = await this.projectService.findManyByIds(projectIds);
    const projectMap = new Map(projects.map((project) => [project._id.toString(), project]));

    return tasks.map((task) => {
      const taskId = task.projectId?.toString();
      const project = taskId ? projectMap.get(taskId) : undefined;
      return {
        ...task.toObject(),
        project: project ? { _id: project._id, name: project.name } : null,
      } as any;
    });
  }
}
