import { ProjectRole } from './project-role.enum';
import { User } from './user.model';
import { Project } from './project.model';

export interface ProjectMemberId {
    userId: number;
    projectId: number;
}

export interface ProjectMember {
    id?: ProjectMemberId;
    user?: User;
    project?: Project;
    roleInProject: ProjectRole;
}
