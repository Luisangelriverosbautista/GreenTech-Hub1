import api from './api';
import type { Project } from '../types';

class ProjectService {
  async getProjects(): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/projects');
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