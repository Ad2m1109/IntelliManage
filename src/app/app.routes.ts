import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role.guard';

// Auth Components
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password';

// Layout
import { MainLayoutComponent } from './layouts/main-layout/main-layout';

// Main Components
import { ProjectComponent } from './components/project/project';
import { InvitationsComponent } from './components/invitations/invitations';
import { ProjectWorkspaceComponent } from './components/project-workspace/project-workspace';
import { ProjectTasksComponent } from './components/project-workspace/tasks/tasks';
import { ProjectMembersComponent } from './components/project-workspace/members/members';
import { ProjectSprintsComponent } from './components/project-workspace/sprints/sprints';
import { AiAnalystComponent } from './components/ai-analyst/ai-analyst';

// Error Components
import { NotFoundComponent } from './components/error/not-found/not-found';

export const routes: Routes = [
    // Auth routes (no layout, no guard)
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'verify-email', loadComponent: () => import('./components/auth/verification/verification').then(m => m.VerificationComponent) },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', loadComponent: () => import('./components/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent) },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },

    // Founder routes
    {
        path: 'founder',
        component: MainLayoutComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'FOUNDER' },
        children: [
            { path: '', redirectTo: 'projects', pathMatch: 'full' },
            { path: 'projects', component: ProjectComponent },
            { path: 'projects/new', loadComponent: () => import('./components/project/create-project/create-project').then(m => m.CreateProjectComponent) },
            {
                path: 'projects/:projectId',
                component: ProjectWorkspaceComponent,
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./components/project-workspace/dashboard/dashboard').then(m => m.ProjectDashboardComponent) },
                    { path: 'members', component: ProjectMembersComponent },
                    { path: 'sprints', component: ProjectSprintsComponent },
                    { path: 'sprints/:sprintId', component: ProjectTasksComponent },
                    { path: 'ai-analyst', component: AiAnalystComponent },
                ]
            },
        ]
    },

    // Employee routes
    {
        path: 'employee',
        component: MainLayoutComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'EMPLOYEE' },
        children: [
            { path: '', redirectTo: 'projects', pathMatch: 'full' },
            { path: 'invitations', component: InvitationsComponent },
            { path: 'projects', component: ProjectComponent },
            {
                path: 'projects/:projectId',
                component: ProjectWorkspaceComponent,
                children: [
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: 'dashboard', loadComponent: () => import('./components/project-workspace/dashboard/dashboard').then(m => m.ProjectDashboardComponent) },
                    { path: 'members', component: ProjectMembersComponent },
                    { path: 'sprints', component: ProjectSprintsComponent },
                    { path: 'sprints/:sprintId', component: ProjectTasksComponent },
                    { path: 'ai-analyst', component: AiAnalystComponent },
                ]
            },
        ]
    },

    // Default redirect based on auth
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

    // Error routes
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '404' }
];
