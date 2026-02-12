import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectDocument> {
    const project = new this.projectModel(createProjectDto);
    return project.save();
  }

  async findById(id: string): Promise<ProjectDocument | null> {
    return this.projectModel.findById(id).exec();
  }

  async findAll(): Promise<ProjectDocument[]> {
    return this.projectModel.find().exec();
  }

  async findManyByIds(ids: Array<ProjectDocument['_id']>): Promise<ProjectDocument[]> {
    return this.projectModel.find({ _id: { $in: ids } }).exec();
  }
}
