import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: 'Create task' })
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @ApiOperation({ summary: 'Get task by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findById(id);
  }

  @ApiOperation({ summary: 'List tasks (filter & sort)' })
  @Get()
  findAll(@Query() query: FilterTasksDto) {
    return this.taskService.findAll(query);
  }

  @ApiOperation({ summary: 'Update task' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @ApiOperation({ summary: 'Delete task' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
