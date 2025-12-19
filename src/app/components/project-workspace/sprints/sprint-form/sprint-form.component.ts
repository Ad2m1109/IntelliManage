import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Sprint, SprintService } from '../../../../services/sprint.service'; // Import SprintService
import { ProjectStateService } from '../../../../services/project-state.service'; // Import ProjectStateService
import { Project } from '../../../../models/project.model'; // Import Project
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-sprint-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sprint-form.component.html',
  styleUrls: ['./sprint-form.component.css']
})
export class SprintFormComponent implements OnInit, OnDestroy {
  @Input() sprint: Sprint | null = null;
  @Output() sprintSubmitted = new EventEmitter<Partial<Sprint>>();
  @Output() cancel = new EventEmitter<void>();

  sprintForm!: FormGroup;
  currentProject: Project | null = null;
  existingSprints: Sprint[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private projectStateService: ProjectStateService,
    private sprintService: SprintService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.projectStateService.selectedProject$.subscribe(project => {
        this.currentProject = project;
        if (project) {
          this.loadExistingSprints(project.id);
        }
      })
    );

    this.sprintForm = this.fb.group({
      name: [this.sprint?.name || '', Validators.required],
      goal: [this.sprint?.goal || ''],
      startDate: [this.formatDate(this.sprint?.startDate), Validators.required],
      endDate: [this.formatDate(this.sprint?.endDate), Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadExistingSprints(projectId: number): void {
    this.subscriptions.add(
      this.sprintService.getProjectSprints(projectId).subscribe((sprints: Sprint[]) => {
        this.existingSprints = sprints;
        // Re-evaluate validators once existing sprints are loaded
        this.sprintForm.setValidators(this.sprintFormValidators());
        this.sprintForm.updateValueAndValidity();
      })
    );
  }

  // Helper to format date for input[type=date]
  private formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.sprintForm.valid) {
      const formValue = this.sprintForm.value;
      const submittedSprint: Partial<Sprint> = {
        id: this.sprint?.id,
        ...formValue
      };
      this.sprintSubmitted.emit(submittedSprint);
    } else {
      this.sprintForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Custom validators will be added here
  private sprintFormValidators(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;

      if (!startDate || !endDate) {
        return null; // Don't validate if dates are not set
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Date Range Validator: startDate must be before endDate
      if (start.getTime() >= end.getTime()) {
        return { dateRange: true };
      }

      // Project Start Date Validator: sprint startDate must be on or after project startDate
      if (this.currentProject && this.currentProject.startDate) {
        const projectStartDate = new Date(this.currentProject.startDate);
        if (start.getTime() < projectStartDate.getTime()) {
          return { projectStartDate: true };
        }
      }

      // Sprint Overlap Validator
      for (const existingSprint of this.existingSprints) {
        // Exclude the current sprint if we are editing
        if (this.sprint && this.sprint.id === existingSprint.id) {
          continue;
        }

        const existingStart = new Date(existingSprint.startDate);
        const existingEnd = new Date(existingSprint.endDate);

        // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
        if (start.getTime() <= existingEnd.getTime() && end.getTime() >= existingStart.getTime()) {
          return { sprintOverlap: true, overlappingSprintName: existingSprint.name };
        }
      }

      return null;
    };
  }
}
