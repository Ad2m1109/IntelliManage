import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Task } from '../../../models/task.model';
import { TaskFormComponent } from './task-form/task-form.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskStatus } from '../../../models/task-status.enum';
import { HasRoleDirective } from '../../../directives/has-role.directive';

@Component({
    selector: 'app-project-tasks',
    standalone: true,
    imports: [CommonModule, TaskFormComponent, DragDropModule, HasRoleDirective],
    templateUrl: './tasks.html',
    styleUrl: './tasks.css'
})
export class ProjectTasksComponent implements OnInit {
    tasks: Task[] = [];
    loading = false;
    userRole: string = '';
    isFounder: boolean = false;
    selectedProjectId?: number;

    // State for the task form
    showTaskForm: boolean = false;
    taskToEdit: Task | null = null;

    // Kanban specific properties
    kanbanColumns: { [key: string]: Task[] } = {
        [TaskStatus.PLANNED]: [],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.COMPLETED]: []
    };
    taskStatuses = Object.values(TaskStatus); // For iterating over columns

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
                this.groupTasksIntoKanbanColumns(data);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading tasks', err);
                this.loading = false;
            }
        });
    }

    private groupTasksIntoKanbanColumns(tasks: Task[]): void {
        this.kanbanColumns = {
            [TaskStatus.PLANNED]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.COMPLETED]: []
        };
        tasks.forEach(task => {
            if (task.status && this.kanbanColumns[task.status]) {
                this.kanbanColumns[task.status].push(task);
            }
        });
    }

    createTask() {
        if (!this.isFounder || !this.selectedProjectId) return;
        this.showTaskForm = true;
        this.taskToEdit = null;
    }

    editTask(task: Task) {
        if (!this.isFounder) return;
        this.showTaskForm = true;
        this.taskToEdit = task;
    }

    assignTask(task: Task) {
        if (!this.isFounder) return;
        this.showTaskForm = true;
        this.taskToEdit = task; // Pre-fill the form with the task to assign
    }

    // This method will be used by the Kanban board for employees
    updateStatus(task: Task) {
        const nextStatus = window.prompt('New status', task.status as any);
        if (!nextStatus) return;
        this.updateTaskStatusBackend(task.id!, nextStatus as TaskStatus);
    }

    drop(event: CdkDragDrop<Task[]>) {
        if (!this.selectedProjectId) return;

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            const task = event.previousContainer.data[event.previousIndex];
            const newStatus = event.container.id as TaskStatus; // The ID of the cdkDropList is the status

            // Update backend
            this.updateTaskStatusBackend(task.id!, newStatus, () => {
                // On success, update frontend
                transferArrayItem(
                    event.previousContainer.data,
                    event.container.data,
                    event.previousIndex,
                    event.currentIndex
                );
                task.status = newStatus; // Update task object's status
            });
        }
    }

    private updateTaskStatusBackend(taskId: number, status: TaskStatus, successCallback?: () => void): void {
        if (!this.selectedProjectId) return;
        this.taskService.updateTask(taskId, { status: status }).subscribe({
            next: () => {
                console.log(`Task ${taskId} status updated to ${status}`);
                if (successCallback) {
                    successCallback();
                }
            },
            error: (err) => {
                console.error('Error updating task status', err);
                // Optionally revert UI changes if backend update fails
                this.loadTasks(this.selectedProjectId!); // Reload tasks to revert UI
            }
        });
    }

    handleTaskSubmitted(taskData: Partial<Task>) {
        if (!this.selectedProjectId) return;

        if (taskData.id) {
            // Update existing task
            this.taskService.updateTask(taskData.id, taskData).subscribe({
                next: () => {
                    this.showTaskForm = false;
                    this.loadTasks(this.selectedProjectId!);
                },
                error: (err) => console.error('Error updating task', err)
            });
        } else {
            // Create new task
            this.taskService.createTask(this.selectedProjectId, taskData).subscribe({
                next: () => {
                    this.showTaskForm = false;
                    this.loadTasks(this.selectedProjectId!);
                },
                error: (err) => console.error('Error creating task', err)
            });
        }
    }

    handleCancel() {
        this.showTaskForm = false;
    }
}
