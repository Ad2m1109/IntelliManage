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

// Project list / summary view used by list screens
export interface ProjectSummary {
    id: number;
    name: string;
    description?: string;
    ownerId?: number;
    ownerName?: string;
    memberCount?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
}
