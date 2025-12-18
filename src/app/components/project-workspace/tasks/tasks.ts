import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectStateService } from '../../../services/project-state.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Task } from '../../../models/task.model';
import { TaskFormComponent } from './task-form/task-form.component';
import { TaskDetailComponent } from './task-detail/task-detail';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskStatus } from '../../../models/task-status.enum';
import { MemberService } from '../../../services/member.service';
import { ProjectMember } from '../../../models/project-member.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-project-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule, TaskFormComponent, TaskDetailComponent, DragDropModule],
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
    selectedTask: Task | null = null;

    // Kanban specific properties
    kanbanColumns: { [key: string]: Task[] } = {
        [TaskStatus.PLANNED]: [],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.COMPLETED]: []
    };
    taskStatuses = Object.values(TaskStatus);

    // Filter properties
    members: ProjectMember[] = [];
    filters: any = {
        assigneeId: null,
        sprintId: null,
        status: null,
        priority: null,
        unassigned: false
    };
    employeeView: 'mine' | 'all' = 'mine';


    constructor(
        private projectState: ProjectStateService,
        private taskService: TaskService,
        public authService: AuthService,
        private memberService: MemberService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.userRole = this.authService.getUserRole() || '';
        this.isFounder = this.userRole === 'FOUNDER';

        this.route.params.subscribe(params => {
            if (params['sprintId']) {
                this.filters.sprintId = params['sprintId'] === 'backlog' ? -1 : +params['sprintId'];
            } else {
                this.filters.sprintId = null;
            }

            this.projectState.selectedProject$.subscribe(project => {
                if (project) {
                    this.selectedProjectId = project.id;
                    if (!this.isFounder) {
                        this.toggleEmployeeView('mine'); // Explicitly set to 'mine' for employees
                    } else {
                        this.loadInitialTasks(); // Founders still use loadInitialTasks for their default view
                    }
                    if (this.isFounder) {
                        this.loadMembersForFilter(project.id);
                    }
                }
            });
        });
    }

    loadInitialTasks() {
        if (!this.selectedProjectId) return;
        this.loading = true;

        // If we have a sprintId filter, use getFilteredTasks even for initial load
        if (this.filters.sprintId !== null) {
            this.taskService.getFilteredTasks(this.selectedProjectId, this.filters).subscribe({
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
            return;
        }

        const obs = this.isFounder
            ? this.taskService.getProjectTasks(this.selectedProjectId)
            : this.taskService.getMyTasks(this.selectedProjectId);

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

    loadMembersForFilter(projectId: number) {
        this.memberService.getProjectMembers(projectId).subscribe(members => {
            this.members = members;
        });
    }

    applyFilters() {
        if (!this.isFounder || !this.selectedProjectId) return;
        this.loading = true;
        this.taskService.getFilteredTasks(this.selectedProjectId, this.filters).subscribe({
            next: (data) => {
                this.tasks = data;
                this.groupTasksIntoKanbanColumns(data);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error applying filters', err);
                this.loading = false;
            }
        });
    }

    toggleEmployeeView(view: 'mine' | 'all') {
        if (this.isFounder || !this.selectedProjectId) return;
        this.employeeView = view;
        this.loading = true;
        const obs = view === 'mine'
            ? this.taskService.getMyTasks(this.selectedProjectId)
            : this.taskService.getProjectTasks(this.selectedProjectId);

        obs.subscribe({
            next: (data) => {
                this.tasks = data;
                this.groupTasksIntoKanbanColumns(data);
                this.loading = false;
                console.log(`Toggling employee view to: ${view}`);
                console.log('--- Tasks Loaded (Employee View Toggle) ---');
                console.log('Received data:', data);
                data.forEach(task => {
                    console.log(`Task ID: ${task.id}, Assignee ID: ${task.assignee?.id}, Current User ID: ${this.authService.getCurrentUser()?.id}`);
                });
                console.log('------------------------------------------');
            },
            error: (err) => {
                console.error('Error switching view', err);
                this.loading = false;
            }
        });
    }


    private groupTasksIntoKanbanColumns(tasks: Task[]): void {
        // Reset columns
        this.kanbanColumns = {
            [TaskStatus.PLANNED]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.COMPLETED]: []
        };
        tasks.forEach(task => {
            // Handle legacy 'TODO' status if necessary
            const status = (task.status as any) === 'TODO' ? TaskStatus.PLANNED : task.status;
            if (status && this.kanbanColumns[status]) {
                this.kanbanColumns[status].push(task);
            }
        });
    }

    createTask() {
        if (!this.isFounder) return;
        this.showTaskForm = true;
        this.taskToEdit = null;
    }

    editTask(task: Task) {
        if (!this.isFounder) return;
        this.showTaskForm = true;
        this.taskToEdit = task;
    }

    drop(event: CdkDragDrop<Task[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            const task = event.previousContainer.data[event.previousIndex];
            const newStatus = event.container.id as TaskStatus;

            // Permission check before updating backend
            if (!this.isFounder && task.assignee?.id !== this.authService.getCurrentUser()?.id) {
                console.warn('Employee can only move their own tasks.');
                return; // Prevent drop
            }

            this.updateTaskStatusBackend(task.id!, newStatus, () => {
                transferArrayItem(
                    event.previousContainer.data,
                    event.container.data,
                    event.previousIndex,
                    event.currentIndex
                );
                task.status = newStatus;
            });
        }
    }

    private updateTaskStatusBackend(taskId: number, status: TaskStatus, successCallback?: () => void): void {
        if (!this.selectedProjectId) return;
        this.taskService.updateTaskStatus(taskId, status).subscribe({
            next: () => {
                if (successCallback) successCallback();
            },
            error: (err) => {
                console.error('Error updating task status:', err);
                this.loadInitialTasks(); // Revert UI on error
            }
        });
    }

    handleTaskSubmitted(taskData: Partial<Task>) {
        if (!this.selectedProjectId || !this.isFounder) return;

        const serviceCall = taskData.id
            ? this.taskService.updateTask(taskData.id, taskData)
            : this.taskService.createTask(this.selectedProjectId, taskData);

        serviceCall.subscribe({
            next: () => {
                this.showTaskForm = false;
                this.taskToEdit = null;
                this.loadInitialTasks();
            },
            error: (err) => console.error('Error submitting task', err)
        });
    }

    handleCancel() {
        this.showTaskForm = false;
        this.taskToEdit = null;
    }

    backToSprints() {
        const userRole = this.authService.isFounder() ? 'founder' : 'employee';
        this.router.navigate([`/${userRole}/projects/${this.selectedProjectId}/sprints`]);
    }

    openTaskDetail(task: Task) {
        this.selectedTask = task;
    }

    closeTaskDetail() {
        this.selectedTask = null;
    }
}
