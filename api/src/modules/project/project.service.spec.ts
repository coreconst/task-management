import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProjectService } from './project.service';
import { Project } from './schemas/project.schema';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let projectModelMock: any;

  beforeEach(async () => {
    projectModelMock = jest.fn();
    projectModelMock.findById = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getModelToken(Project.name),
          useValue: projectModelMock,
        },
      ],
    }).compile();

    projectService = moduleRef.get(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a project', async () => {
    const savedProject = { _id: 'project-id', name: 'Test Project' };
    projectModelMock.mockImplementation(function (this: any, dto: { name: string }) {
      this.name = dto.name;
      this.save = jest.fn().mockResolvedValue(savedProject);
    });

    const result = await projectService.create({ name: 'Test Project' });

    expect(projectModelMock).toHaveBeenCalledWith({ name: 'Test Project' });
    expect(result).toEqual(savedProject);
  });

  it('finds a project by id', async () => {
    const project = { _id: 'project-id', name: 'Test Project' };
    projectModelMock.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(project),
    });

    const result = await projectService.findById('project-id');

    expect(projectModelMock.findById).toHaveBeenCalledWith('project-id');
    expect(result).toEqual(project);
  });
});
