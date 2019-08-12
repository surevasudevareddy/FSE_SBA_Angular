import { User } from './user';

export class Project {
    projectId: number;
    projectName: string;
    startDate: Date;
    endDate: Date;
    priority: number;
    user: User = new User();
    tasksCount: number;
    completedTasks: number;
}
