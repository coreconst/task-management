import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {Project} from "../../project/schemas/project.schema";

export type TaskDocument = HydratedDocument<Task>;

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}

@Schema({ timestamps: true })
export class Task {
    @Prop({ type: Types.ObjectId, ref:  Project.name })
    projectId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: TaskStatus, default: TaskStatus.TODO })
    status: TaskStatus;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
