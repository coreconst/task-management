import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task, TaskSchema } from './schemas/task.schema';
import { ProjectModule } from "../project/project.module";

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
      ProjectModule
  ],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
