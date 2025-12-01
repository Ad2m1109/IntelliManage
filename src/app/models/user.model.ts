export interface User {
    id: number;
    email: string;
    fullName: string;
    roleType: 'FOUNDER' | 'EMPLOYEE';
    createdAt?: string;
}
