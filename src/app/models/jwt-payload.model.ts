export interface JwtPayload {
    sub: string; // Subject (usually user ID)
    email: string;
    fullName: string;
    roleType: 'FOUNDER' | 'EMPLOYEE';
    iat: number; // Issued at
    exp: number; // Expiration time
    // Add other custom claims if present in your JWT
}
