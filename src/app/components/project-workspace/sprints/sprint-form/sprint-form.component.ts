import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sprint } from '../../../../services/sprint.service';

@Component({
  selector: 'app-sprint-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sprint-form.component.html',
  styleUrls: ['./sprint-form.component.css']
})
export class SprintFormComponent implements OnInit {
  @Input() sprint: Sprint | null = null;
  @Output() sprintSubmitted = new EventEmitter<Partial<Sprint>>();
  @Output() cancel = new EventEmitter<void>();

  sprintForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.sprintForm = this.fb.group({
      name: [this.sprint?.name || '', Validators.required],
      goal: [this.sprint?.goal || ''],
      startDate: [this.formatDate(this.sprint?.startDate), Validators.required],
      endDate: [this.formatDate(this.sprint?.endDate), Validators.required]
    });
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
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
