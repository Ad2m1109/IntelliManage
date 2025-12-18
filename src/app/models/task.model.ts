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
    projectId?: number;
    projectName?: string;
    sprint?: Sprint;
    sprintId?: number;
    sprintName?: string;
    assignee?: User;
    assigneeId?: number;
    assigneeName?: string;
    reporter?: User;
    reporterId?: number;
    reporterName?: string;
    createdAt?: string;
}
