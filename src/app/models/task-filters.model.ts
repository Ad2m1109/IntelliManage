export interface TaskFilters {
    assigneeId: number | null;
    sprintId: number | null;
    status: string | null;
    priority: string | null;
    unassigned: boolean;
    [key: string]: any; // Add index signature
}
