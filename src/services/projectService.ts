import api from './api';
import { Project, ProjectsResponse, ProjectFilters } from '@/types';

export const projectService = {
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: { name: string; description?: string; status?: Project['status'] }): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};

