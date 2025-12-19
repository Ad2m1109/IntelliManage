import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invite-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invite-member-dialog.component.html',
  styleUrl: './invite-member-dialog.component.css'
})
export class InviteMemberDialogComponent {
  @Input() title: string = 'Invite Member';
  @Input() message: string = 'Enter the email address of the member you want to invite:';
  @Input() confirmText: string = 'Invite';
  @Input() cancelText: string = 'Cancel';

  email: string = '';

  @Output() closeDialog = new EventEmitter<string | null>();

  onInvite(): void {
    if (this.email && this.email.trim()) {
      this.closeDialog.emit(this.email.trim());
    } else {
      this.closeDialog.emit(null); // Or emit undefined, or handle validation error
    }
  }

  onCancel(): void {
    this.closeDialog.emit(null);
  }
}
