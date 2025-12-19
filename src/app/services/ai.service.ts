import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { ChatLogRequest, GeminiRequest, GeminiResponse } from '../models/ai-analysis.model'; // Import ChatLogRequest

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private backendUrl = `${config.apiUrl}/api/chat-logs`; // Re-added backend URL
    // WARNING: Exposing API Key in frontend is not secure for production.
    // This key should ideally be proxied through a backend server.
    private geminiApiKey = config.geminiApiKey;
    private geminiApiUrl = config.geminiApiUrl;

    constructor(private http: HttpClient) { }

    // Generate content using Gemini API directly
    generateContent(prompt: string): Observable<GeminiResponse> {
        const body: GeminiRequest = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'X-goog-api-key': this.geminiApiKey
        });

        return this.http.post<GeminiResponse>(this.geminiApiUrl, body, { headers });
    }

    // Save chat log to backend
    saveChatLog(chatLog: ChatLogRequest): Observable<any> {
        return this.http.post(this.backendUrl, chatLog);
    }
}
