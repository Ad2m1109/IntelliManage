import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-host.component.html',
  styleUrl: './notification-host.component.css'
})
export class NotificationHostComponent implements OnInit, OnDestroy {
  currentNotification: Notification | null = null;
  private notificationSubscription!: Subscription;
  private timeoutId: any;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notification$.subscribe(notification => {
      this.currentNotification = notification;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      if (notification.duration) {
        this.timeoutId = setTimeout(() => {
          this.clearNotification();
        }, notification.duration);
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationSubscription.unsubscribe();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  clearNotification(): void {
    this.currentNotification = null;
  }

  getNotificationClass(): string {
    if (!this.currentNotification) {
      return '';
    }
    return `notification-${this.currentNotification.type}`;
  }
}
