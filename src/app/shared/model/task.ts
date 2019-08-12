import { ParentTask } from './parent-task';
import { Project } from './project';
import { User } from './user';

export class Task {
    taskId: number;
    parentTask: ParentTask;
    project: Project;
    user: User;
    taskName: string;
    startDate: Date;
    endDate: Date;
    priority: number;
    status: string;
}
