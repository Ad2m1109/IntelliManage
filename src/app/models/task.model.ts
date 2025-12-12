import { TaskStatus } from './task-status.enum';
import { Project } from './project.model';
import { Sprint } from './sprint.model';
import { User } from './user.model';

export interface Task {
    id?: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: string;
    project?: Project;
    sprint?: Sprint;
    assignee?: User;
    assigneeId?: number;
    reporter?: User;
    sprintId?: number;
    createdAt?: string;
}
