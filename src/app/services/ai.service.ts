import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    private apiKey = 'AIzaSyC0HwIBDVbZqndhSZ4Au80aLpMAI6ooTl0'; // Ideally, this should be in environment variables

    constructor(private http: HttpClient) { }

    generateContent(prompt: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
        });

        const body = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        };

        return this.http.post(this.apiUrl, body, { headers });
    }
}
