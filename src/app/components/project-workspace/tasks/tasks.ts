import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { SearchService } from '../../../services/search.service'; // Import SearchService
import { Subscription } from 'rxjs'; // Import Subscription
import { TaskFilters } from '../../../models/task-filters.model'; // Import TaskFilters

@Component({
    selector: 'app-project-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule, TaskFormComponent, TaskDetailComponent, DragDropModule],
    templateUrl: './tasks.html',
    styleUrl: './tasks.css'
})
export class ProjectTasksComponent implements OnInit, OnDestroy { // Implement OnDestroy
    allTasks: Task[] = []; // Store all tasks
    filteredTasks: Task[] = []; // Store tasks after applying search and other filters
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
    filters: TaskFilters = {
        assigneeId: null,
        sprintId: null,
        status: null,
        priority: null,
        unassigned: false
    };
    employeeView: 'mine' | 'all' = 'mine';
    private searchSubscription: Subscription = new Subscription(); // To manage search term subscription
    private routeSub: Subscription = new Subscription(); // To manage route params subscription
    private projectStateSub: Subscription = new Subscription(); // To manage project state subscription


    constructor(
        private projectState: ProjectStateService,
        private taskService: TaskService,
        public authService: AuthService,
        private memberService: MemberService,
        private route: ActivatedRoute,
        private router: Router,
        private searchService: SearchService // Inject SearchService
    ) { }

    ngOnInit() {
        this.userRole = this.authService.getUserRole() || '';
        this.isFounder = this.userRole === 'FOUNDER';

        this.routeSub = this.route.params.subscribe(params => {
            if (params['sprintId']) {
                this.filters.sprintId = params['sprintId'] === 'backlog' ? -1 : +params['sprintId'];
            } else {
                this.filters.sprintId = null;
            }

            this.projectStateSub = this.projectState.selectedProject$.subscribe(project => {
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

        // Subscribe to search term changes
        this.searchSubscription = this.searchService.searchTerm$.subscribe(term => {
            this.applyAllFilters(term); // Apply search term along with other filters
        });
    }

    ngOnDestroy(): void {
        this.searchSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
        this.routeSub.unsubscribe(); // Unsubscribe from route params
        this.projectStateSub.unsubscribe(); // Unsubscribe from project state
    }

    loadInitialTasks() {
        if (!this.selectedProjectId) return;
        this.loading = true;

        const currentSearchTerm = this.searchService.getSearchTerm();

        // If we have a sprintId filter, use getFilteredTasks even for initial load
        if (this.filters.sprintId !== null) {
            this.taskService.getFilteredTasks(this.selectedProjectId, this.filters).subscribe({
                next: (data) => {
                    this.allTasks = data;
                    this.applyAllFilters(currentSearchTerm); // Apply search term after loading
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
                this.allTasks = data;
                this.applyAllFilters(currentSearchTerm); // Apply search term after loading
                this.loading = false;
            },
            error: (err) => {
                /* Handle error */ // Consider a notification service
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
        const currentSearchTerm = this.searchService.getSearchTerm();
        this.taskService.getFilteredTasks(this.selectedProjectId, this.filters).subscribe({
            next: (data) => {
                this.allTasks = data;
                this.applyAllFilters(currentSearchTerm); // Apply search term after loading
                this.loading = false;
            },
            error: (err) => {
                /* Handle error */ // Consider a notification service
                this.loading = false;
            }
        });
    }

    applyAllFilters(searchTerm: string = this.searchService.getSearchTerm()): void {
        let tempTasks = [...this.allTasks];

        // Apply search term filter
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            tempTasks = tempTasks.filter(task =>
                task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                (task.description && task.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (task.assigneeName && task.assigneeName.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        // The `allTasks` array should already reflect any backend filters (like sprintId, assigneeId, etc.)
        // applied during the data fetching (`loadInitialTasks`, `applyFilters`, `toggleEmployeeView`).
        // This `applyAllFilters` method then applies the client-side search term on top of that.
        this.filteredTasks = tempTasks;
        this.groupTasksIntoKanbanColumns(this.filteredTasks);
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
                this.allTasks = data;
                this.applyAllFilters(); // Apply search term after loading
                this.loading = false;
            },
            error: (err) => {
                /* Handle error */ // Consider a notification service
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
            if (!this.isFounder && task.assigneeId !== this.authService.getCurrentUser()?.id) {
                /* Handle warning */ // Consider a notification service
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
                /* Handle error */ // Consider a notification service
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
            error: (err) => {
                /* Handle error */ // Consider a notification service
            }
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
