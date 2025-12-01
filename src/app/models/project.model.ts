export interface Project {
    id: number;
    name: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    endDate?: string;
    createdAt?: string;
}

export interface ProjectMember {
    id: number;
    projectId: number;
    userId: number;
    userName: string;
    roleInProject: string;
    joinedAt: string;
}

export interface ProjectInvitation {
    id: number;
    projectId: number;
    projectName: string;
    invitedUserId: number;
    invitedUserName: string;
    invitedById: number;
    invitedByName: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    respondedAt?: string;
}
