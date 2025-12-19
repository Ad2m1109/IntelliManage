import { Project } from './project.model';
import { Task } from './task.model';

export interface Sprint {
    id?: number;
    name: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    project?: Project;
    status?: string; // Add status property
    progress?: number; // Added progress property
    tasks?: Task[];
}
