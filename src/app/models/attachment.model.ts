import { Task } from './task.model';
import { User } from './user.model';

export interface Attachment {
    id?: number;
    fileName: string;
    fileUrl: string;
    user?: User;
    task?: Task;
    createdAt?: string;
}
