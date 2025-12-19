import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatMessage, ChatLogRequest } from '../../models/ai-analysis.model'; // Import ChatMessage and ChatLogRequest
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { ProjectStateService } from '../../services/project-state.service'; // Import ProjectStateService

@Component({
  selector: 'app-ai-analyst',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-analyst.html',
  styleUrl: './ai-analyst.css'
})
export class AiAnalystComponent implements OnInit {
  messages: ChatMessage[] = [];
  userInput: string = '';
  loading: boolean = false;

  constructor(
    private aiService: AiService,
    private notificationService: NotificationService,
    private authService: AuthService, // Inject AuthService
    private projectStateService: ProjectStateService // Inject ProjectStateService
  ) { }

  ngOnInit() {
    // No chat history loaded from backend
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage: ChatMessage = { text: this.userInput, sender: 'user' };
    this.messages.push(userMessage);
    this.userInput = '';
    this.loading = true;

    // Call Gemini API directly
    this.aiService.generateContent(userMessage.text).pipe(
      catchError((err: HttpErrorResponse) => {
        this.notificationService.error(err.error?.message || 'Error communicating with AI Analyst.');
        const errorMessage: ChatMessage = { text: 'Error communicating with AI Analyst.', sender: 'ai' };
        this.messages.push(errorMessage);
        this.loading = false;
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => {
        const aiText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
        const aiMessage: ChatMessage = { text: aiText, sender: 'ai' };
        this.messages.push(aiMessage);
        this.loading = false;
      }
    });
  }

  saveMessageToBackend(message: ChatMessage) {
    const currentUser = this.authService.getCurrentUser();
    const currentProject = this.projectStateService.getCurrentProject();

    if (!currentUser || !currentProject) {
      this.notificationService.error('User or Project not found. Cannot save message.');
      return;
    }

    const chatLogRequest: ChatLogRequest = {
      userId: currentUser.id,
      projectId: currentProject.id,
      content: message.text,
      date: new Date().toISOString() // Use ISO string for date
    };

    this.aiService.saveChatLog(chatLogRequest).pipe(
      catchError((err: HttpErrorResponse) => {
        this.notificationService.error(err.error?.message || 'Error saving message to backend.');
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.notificationService.success('Message saved successfully!');
        // Mark the message as saved in the frontend
        const index = this.messages.indexOf(message);
        if (index > -1) {
          this.messages[index].saved = true;
        }
      }
    });
  }
}
