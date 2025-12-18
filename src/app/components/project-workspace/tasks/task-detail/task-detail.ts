import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../../models/task.model';
import { CommentService, Comment } from '../../../../services/comment.service';
import { AttachmentService, Attachment } from '../../../../services/attachment.service';
import { TaskActivityService, TaskActivity } from '../../../../services/task-activity.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './task-detail.html',
    styleUrl: './task-detail.css'
})
export class TaskDetailComponent implements OnInit {
    @Input() task!: Task;
    @Output() close = new EventEmitter<void>();
    @Output() taskUpdated = new EventEmitter<void>();

    comments: Comment[] = [];
    attachments: Attachment[] = [];
    activities: TaskActivity[] = [];

    newCommentContent: string = '';
    activeTab: 'comments' | 'attachments' | 'history' = 'comments';
    loading = false;

    constructor(
        private commentService: CommentService,
        private attachmentService: AttachmentService,
        private activityService: TaskActivityService,
        public authService: AuthService
    ) { }

    ngOnInit() {
        this.loadAllData();
    }

    loadAllData() {
        if (!this.task || !this.task.id) return;
        this.loading = true;
        const taskId = this.task.id;

        this.commentService.getTaskComments(taskId).subscribe(data => this.comments = data);
        this.attachmentService.getTaskAttachments(taskId).subscribe(data => this.attachments = data);
        this.activityService.getTaskActivities(taskId).subscribe(data => {
            this.activities = data;
            this.loading = false;
        });
    }

    addComment() {
        if (!this.newCommentContent.trim() || !this.task.id) return;

        this.commentService.createComment(this.task.id, this.newCommentContent).subscribe({
            next: (comment) => {
                this.comments.unshift(comment);
                this.newCommentContent = '';
            },
            error: (err) => console.error('Error adding comment', err)
        });
    }

    deleteComment(commentId: number) {
        if (confirm('Delete this comment?')) {
            this.commentService.deleteComment(commentId).subscribe(() => {
                this.comments = this.comments.filter(c => c.id !== commentId);
            });
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Mock upload for now
            const mockAttachment: Partial<Attachment> = {
                fileName: file.name,
                fileUrl: 'https://via.placeholder.com/150', // Mock URL
                fileType: file.type,
                fileSize: file.size
            };

            this.attachmentService.createAttachment(this.task.id!, mockAttachment).subscribe({
                next: (attachment) => {
                    this.attachments.unshift(attachment);
                },
                error: (err) => console.error('Error uploading attachment', err)
            });
        }
    }

    deleteAttachment(attachmentId: number) {
        if (confirm('Delete this attachment?')) {
            this.attachmentService.deleteAttachment(attachmentId).subscribe(() => {
                this.attachments = this.attachments.filter(a => a.id !== attachmentId);
            });
        }
    }

    formatAction(action: string): string {
        switch (action) {
            case 'TASK_CREATED': return 'created the task';
            case 'STATUS_CHANGE': return 'changed status';
            case 'ASSIGNEE_CHANGE': return 'changed assignee';
            default: return action.toLowerCase().replace('_', ' ');
        }
    }
}
