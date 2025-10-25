import api from './api';
import type { Interview, Problem, InterviewResult } from '../types/interview';

export const interviewService = {
  async getProblems(): Promise<Problem[]> {
    const response = await api.get('/problems');
    return response.data;
  },

  async getProblemById(id: string): Promise<Problem> {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  async sendOA(problemId: string, candidateEmail: string): Promise<Interview> {
    const response = await api.post('/interviews', {
      problemId,
      candidateEmail,
    });
    return response.data;
  },

  async getPendingOAs(): Promise<Interview[]> {
    const response = await api.get('/interviews?status=pending');
    return response.data;
  },

  async getCompletedOAs(): Promise<Interview[]> {
    const response = await api.get('/interviews?status=completed');
    return response.data;
  },

  async getInterviewResults(interviewId: string): Promise<InterviewResult> {
    const response = await api.get(`/interviews/${interviewId}/results`);
    return response.data;
  },

  async submitInterview(interviewId: string, data: any): Promise<InterviewResult> {
    const response = await api.post(`/interviews/${interviewId}/submit`, data);
    return response.data;
  },

  async saveDiagramSnapshot(interviewId: string, diagram: any): Promise<void> {
    await api.post(`/interviews/${interviewId}/diagrams`, diagram);
  },
};
