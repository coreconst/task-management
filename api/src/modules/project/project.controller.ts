import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectService } from './project.service';

@ApiTags('projects')
@ApiBearerAuth('access-token')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create project' })
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @ApiOperation({ summary: 'Get project by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findById(id);
  }

  @ApiOperation({ summary: 'Get all projects' })
  @Get()
  findAll() {
    return this.projectService.findAll();
  }
}
