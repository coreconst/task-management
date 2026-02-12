import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TaskService } from './task.service';
import { Task } from './schemas/task.schema';
import { ProjectService } from '../project/project.service';

describe('TaskService', () => {
  let taskService: TaskService;
  let taskModelMock: any;
  let projectServiceMock: { findById: jest.Mock };

  beforeEach(async () => {
    taskModelMock = jest.fn();
    taskModelMock.findById = jest.fn();
    taskModelMock.find = jest.fn();
    taskModelMock.findByIdAndUpdate = jest.fn();
    taskModelMock.findByIdAndDelete = jest.fn();

    projectServiceMock = {
      findById: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: taskModelMock,
        },
        {
          provide: ProjectService,
          useValue: projectServiceMock,
        },
      ],
    }).compile();

    taskService = moduleRef.get(TaskService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a task with valid projectId', async () => {
    const savedTask = { _id: 'task-id', name: 'Task', status: 'todo' };
    const projectId = new Types.ObjectId().toHexString();

    projectServiceMock.findById.mockResolvedValue({ _id: projectId });
    taskModelMock.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(savedTask),
    }));

    const result = await taskService.create({
      name: 'Task',
      projectId,
    });

    expect(projectServiceMock.findById).toHaveBeenCalledWith(projectId);
    expect(taskModelMock).toHaveBeenCalled();
    expect(result).toEqual(savedTask);
  });

  it('throws NotFoundException for invalid projectId', async () => {
    await expect(
      taskService.create({
        name: 'Task',
        projectId: 'bad-id',
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates a task without projectId', async () => {
    const taskId = new Types.ObjectId().toHexString();
    taskModelMock.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: taskId, name: 'Updated' }),
    });

    const result = await taskService.update(taskId, { name: 'Updated' });

    expect(projectServiceMock.findById).not.toHaveBeenCalled();
    expect(taskModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
      taskId,
      { name: 'Updated' },
      { returnDocument: 'after' }
    );
    expect(result?._id).toBe(taskId);
  });

  it('removes a task', async () => {
    const taskId = new Types.ObjectId().toHexString();
    taskModelMock.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: taskId }),
    });

    const result = await taskService.remove(taskId);

    expect(taskModelMock.findByIdAndDelete).toHaveBeenCalledWith(taskId);
    expect(result?._id).toBe(taskId);
  });
});
