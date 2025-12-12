
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { config } from '../config';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private backendUrl = `${config.apiUrl}/chat-logs`;
    // WARNING: Exposing API Key in frontend is not secure for production.
    private geminiApiKey = config.geminiApiKey;
    private geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`;

    constructor(private http: HttpClient) { }

    // Fetch chat history from backend
    getChatHistory(): Observable<any[]> {
        return this.http.get<any[]>(this.backendUrl);
    }

    // Save message to backend
    saveMessage(message: string, sender: 'user' | 'ai'): Observable<any> {
        return this.http.post(this.backendUrl, { message, sender });
    }

    // Generate content using Gemini API directly
    generateContent(prompt: string): Observable<any> {
        const body = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post(this.geminiApiUrl, body, { headers });
    }
}
