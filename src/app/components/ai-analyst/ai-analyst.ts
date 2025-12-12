import { Component, OnInit } from '@angular/core';
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
export class AiAnalystComponent implements OnInit {
  messages: ChatMessage[] = [];
  userInput: string = '';
  loading: boolean = false;

  constructor(private aiService: AiService) { }

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
}
