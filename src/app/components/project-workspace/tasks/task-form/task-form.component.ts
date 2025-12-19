import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task } from '../../../../models/task.model';
import { TaskStatus } from '../../../../models/task-status.enum';
import { User } from '../../../../models/user.model';
import { Sprint } from '../../../../models/sprint.model';
import { MemberService } from '../../../../services/member.service';
import { SprintService } from '../../../../services/sprint.service';
import { ProjectStateService } from '../../../../services/project-state.service';
import { Subscription } from 'rxjs';

interface AssigneeOption {
  id: number;
  fullName: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent implements OnInit, OnDestroy {
  @Input() task: Task | null = null;
  @Output() taskSubmitted = new EventEmitter<Partial<Task>>();
  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  taskStatuses = Object.values(TaskStatus);
  priorities = ['LOW', 'MEDIUM', 'HIGH'];
  members: AssigneeOption[] = [];
  sprints: Sprint[] = [];
  selectedProjectId: number | null = null;
  private projectSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private sprintService: SprintService,
    private projectStateService: ProjectStateService
  ) { }

  ngOnInit(): void {
    this.projectSubscription = this.projectStateService.selectedProject$.subscribe(project => {
      if (project) {
        this.selectedProjectId = project.id;
        this.loadMembers();
        this.loadSprints();
      }
    });

    this.taskForm = this.fb.group({
      title: [this.task?.title || '', Validators.required],
      description: [this.task?.description || ''],
      status: [this.task?.status || TaskStatus.PLANNED, Validators.required],
      priority: [this.task?.priority || 'MEDIUM', Validators.required],
      assigneeId: [this.task?.assigneeId || null],
      sprintId: [this.task?.sprintId || null],
    });
  }

  ngOnDestroy(): void {
    this.projectSubscription?.unsubscribe();
  }

  loadMembers(): void {
    if (this.selectedProjectId) {
      this.memberService.getProjectMembers(this.selectedProjectId).subscribe({
        next: (members) => {
          this.members = members.map(m => ({
            id: m.userId,
            fullName: m.userName
          }));
        },
        error: (err) => {
          /* Handle error */ // Consider a notification service
        },
      });
    }
  }

  loadSprints(): void {
    if (this.selectedProjectId) {
      this.sprintService.getProjectSprints(this.selectedProjectId).subscribe({
        next: (sprints) => {
          this.sprints = sprints;
        },
        error: (err) => {
          /* Handle error */ // Consider a notification service
        },
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const submittedTask: Partial<Task> = {
        id: this.task?.id,
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        priority: formValue.priority,
        assigneeId: formValue.assigneeId,
        sprintId: formValue.sprintId,
        assignee: formValue.assigneeId ? { id: formValue.assigneeId } as User : undefined,
        sprint: formValue.sprintId ? { id: formValue.sprintId } as Sprint : undefined,
      };
      this.taskSubmitted.emit(submittedTask);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
