import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Task } from '../../../models/task.model';

@Component({
    selector: 'app-project-tasks',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tasks.html',
    styleUrl: './tasks.css'
})
export class ProjectTasksComponent implements OnInit {
    tasks: Task[] = [];
    loading = false;
    userRole: string = '';
    isFounder: boolean = false;
    selectedProjectId?: number;

    constructor(
        private projectState: ProjectStateService,
        private taskService: TaskService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.userRole = this.authService.getUserRole() || '';
        this.isFounder = this.userRole === 'FOUNDER';

        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.selectedProjectId = project.id;
                this.loadTasks(project.id);
            }
        });
    }

    loadTasks(projectId: number) {
        this.loading = true;
        const obs = this.isFounder
            ? this.taskService.getProjectTasks(projectId)
            : this.taskService.getMyTasks(projectId);

        obs.subscribe({
            next: (data) => {
                this.tasks = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading tasks', err);
                this.loading = false;
            }
        });
    }

    createTask() {
        if (!this.isFounder || !this.selectedProjectId) return;
        const title = window.prompt('Task title');
        if (!title) return;
        const task: Partial<Task> = { title, status: 'TODO' as any, priority: 'MEDIUM' };
        this.taskService.createTask(this.selectedProjectId, task).subscribe({
            next: () => this.loadTasks(this.selectedProjectId!),
            error: (err) => console.error('Error creating task', err)
        });
    }

    editTask(task: Task) {
        if (!this.isFounder) return;
        const title = window.prompt('Edit title', task.title);
        if (title === null) return;
        this.taskService.updateTask(task.id!, { title }).subscribe({
            next: () => this.loadTasks(this.selectedProjectId!),
            error: (err) => console.error('Error updating task', err)
        });
    }

    assignTask(task: Task) {
        if (!this.isFounder) return;
        const userIdStr = window.prompt('Assign to userId');
        const userId = userIdStr ? Number(userIdStr) : null;
        if (!userId) return;
        this.taskService.updateTask(task.id!, { assignee: { id: userId } as any }).subscribe({
            next: () => this.loadTasks(this.selectedProjectId!),
            error: (err) => console.error('Error assigning task', err)
        });
    }

    updateStatus(task: Task) {
        const nextStatus = window.prompt('New status', task.status as any);
        if (!nextStatus) return;
        this.taskService.updateTask(task.id!, { status: nextStatus as any }).subscribe({
            next: () => this.loadTasks(this.selectedProjectId!),
            error: (err) => console.error('Error updating status', err)
        });
    }
}
