import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { ProjectStateService } from '../../services/project-state.service';
import { TaskService } from '../../services/task.service';
import { SprintService } from '../../services/sprint.service';
import { forkJoin } from 'rxjs';

interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
}

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
    private projectState: ProjectStateService,
    private taskService: TaskService,
    private sprintService: SprintService
  ) { }

  ngOnInit() {
    this.loadChatHistory();
  }

  loadChatHistory() {
    this.aiService.getChatHistory().subscribe({
      next: (history) => {
        this.messages = history.map(log => ({
          text: log.message,
          sender: log.sender as 'user' | 'ai'
        }));
      },
      error: (err) => console.error('Error loading chat history:', err)
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({ text: userMessage, sender: 'user' });
    this.userInput = '';
    this.loading = true;

    // 1. Save User Message
    this.aiService.saveMessage(userMessage, 'user').subscribe({
      error: (err) => console.error('Error saving user message:', err)
    });

    // 2. Call Gemini API
    this.aiService.generateContent(userMessage).subscribe({
      next: (response) => {
        // Parse Gemini Response
        const aiText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';

        this.messages.push({ text: aiText, sender: 'ai' });
        this.loading = false;

        // 3. Save AI Response
        this.aiService.saveMessage(aiText, 'ai').subscribe({
          error: (err) => console.error('Error saving AI message:', err)
        });
      },
      error: (err) => {
        console.error('AI Error:', err);
        this.messages.push({ text: 'Error communicating with AI Analyst.', sender: 'ai' });
        this.loading = false;
      }
    });
  }

  generateProjectInsights() {
    const project = this.projectState.getCurrentProject();
    if (!project) return;

    this.loading = true;
    this.messages.push({ text: 'Generating project insights...', sender: 'user' });

    forkJoin({
      tasks: this.taskService.getProjectTasks(project.id),
      sprints: this.sprintService.getProjectSprints(project.id)
    }).subscribe({
      next: (data) => {
        const taskSummary = data.tasks.map(t => `- ${t.title} (${t.status}, ${t.priority})`).join('\n');
        const sprintSummary = data.sprints.map(s => `- ${s.name} (${s.status}, Goal: ${s.goal})`).join('\n');

        const prompt = `
          Analyze the following project data and provide:
          1. A concise progress summary.
          2. Risk detection (e.g., blocked tasks, overdue sprints).
          3. Sprint health analysis.

          Project: ${project.name}
          Description: ${project.description}

          Tasks:
          ${taskSummary}

          Sprints:
          ${sprintSummary}
        `;

        this.aiService.generateContent(prompt).subscribe({
          next: (response) => {
            const aiText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
            this.messages.push({ text: aiText, sender: 'ai' });
            this.loading = false;
            this.aiService.saveMessage(aiText, 'ai').subscribe();
          },
          error: (err) => {
            console.error('AI Error:', err);
            this.messages.push({ text: 'Error generating insights.', sender: 'ai' });
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching project data', err);
        this.loading = false;
      }
    });
  }
}
