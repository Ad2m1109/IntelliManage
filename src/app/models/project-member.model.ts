import { ProjectRole } from './project-role.enum';
// import { User } from './user.model'; // No longer directly nested
// import { Project } from './project.model'; // No longer directly nested

export interface ProjectMember {
    // id?: ProjectMemberId; // Replaced by direct userId and projectId
    userId: number;
    userName: string;
    userEmail: string;
    projectId: number;
    projectName?: string; // Added from backend DTO
    roleInProject: ProjectRole;
    joinedAt?: string; // Added from backend DTO
}
