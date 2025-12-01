import { Project } from './project.model';

export interface Sprint {
    id?: number;
    name: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    project?: Project;
}
