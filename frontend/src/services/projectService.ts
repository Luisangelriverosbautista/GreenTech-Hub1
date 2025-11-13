import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Project {
  id: string;
  title: string;
  description: string;
  impact: string;
  funds: number;
}

export const projectService = {
  async getProjects() {
    const response = await axios.get(`${API_URL}/projects`);
    return response.data;
  },

  async createProject(project: Omit<Project, 'id'>) {
    const response = await axios.post(`${API_URL}/projects`, project);
    return response.data;
  },

  async supportProject(projectId: string, amount: number) {
    const response = await axios.post(`${API_URL}/projects/${projectId}/support`, { amount });
    return response.data;
  }
};