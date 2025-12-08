import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';

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
export class AiAnalystComponent {
  messages: ChatMessage[] = [];
  userInput: string = '';
  loading: boolean = false;

  constructor(private aiService: AiService) { }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const userMessage = this.userInput;
    this.messages.push({ text: userMessage, sender: 'user' });
    this.userInput = '';
    this.loading = true;

    this.aiService.generateContent(userMessage).subscribe({
      next: (response) => {
        const aiText = response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
        this.messages.push({ text: aiText, sender: 'ai' });
        this.loading = false;
      },
      error: (err) => {
        console.error('AI Error:', err);
        this.messages.push({ text: 'Error communicating with AI Analyst.', sender: 'ai' });
        this.loading = false;
      }
    });
  }
}
