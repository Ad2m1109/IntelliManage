import { AnalysisType } from './analysis-type.enum';
import { Task } from './task.model';

export interface AIAnalysis {
    id?: number;
    task?: Task;
    analysisType: AnalysisType;
    resultText?: string;
    createdAt?: string;
}
