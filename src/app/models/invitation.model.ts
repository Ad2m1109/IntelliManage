export interface ProjectInvitation {
    id: number;
    projectId: number;
    projectName?: string;
    invitedUserId?: number;
    invitedUserEmail?: string;
    invitedUserName?: string;
    invitedById?: number;
    invitedByName?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt?: string;
    respondedAt?: string;
}
