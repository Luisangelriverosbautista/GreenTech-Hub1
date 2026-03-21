import api from './api';
import type { Project } from '../types';

class ProjectService {
  async getProjects(status?: string): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/projects', {
        params: status ? { status } : undefined,
      });
      console.log('Projects fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async createProject(project: Omit<Project, 'id' | 'walletAddress' | 'creatorId' | 'creatorName' | 'funded' | 'transactions' | 'status' | 'raisedAmount' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      console.log('Creating project with data:', project);
      const response = await api.post<Project>('/projects', project);
      console.log('Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProjectKyc(id: string, payload: { profileType: 'individual' | 'organization'; documents: string[] }): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}/kyc`, payload);
    return response.data;
  }

  async submitProjectForReview(id: string): Promise<{ message: string; score: number; project: Project }> {
    const response = await api.post<{ message: string; score: number; project: Project }>(`/projects/${id}/submit-review`);
    return response.data;
  }

  async getManualReviewQueue(adminKey: string): Promise<{ count: number; projects: Project[] }> {
    const response = await api.get<{ count: number; projects: Project[] }>('/projects/review-queue/manual', {
      headers: {
        'x-review-admin-key': adminKey
      }
    });
    return response.data;
  }

  async submitManualReview(
    id: string,
    payload: { decision: 'approve' | 'reject'; notes?: string },
    adminKey: string
  ): Promise<Project> {
    const response = await api.post<Project>(`/projects/${id}/manual-review`, payload, {
      headers: {
        'x-review-admin-key': adminKey
      }
    });
    return response.data;
  }

  async updateProject(id: string, project: Partial<Omit<Project, 'id' | 'walletAddress' | 'creatorId' | 'funded' | 'transactions' | 'status'>>): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, project);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const response = await api.get<Project[]>(`/users/${userId}/projects`);
    return response.data;
  }

  async fundProject(id: string, amount: number): Promise<void> {
    await api.post(`/projects/${id}/fund`, { amount });
  }

  async getMyProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects/me');
    return response.data;
  }
}

export const projectService = new ProjectService();
export default projectService;