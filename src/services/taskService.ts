import api from './api';
import { Task, TasksResponse, TaskFilters } from '@/types';

export const taskService = {
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams();
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', (filters.limit || 20).toString());
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: {
    title: string;
    description?: string;
    projectId: string;
    priority: Task['priority'];
    dueDate?: string;
    assignedTo?: string;
  }): Promise<Task> {
    // Convertir camelCase a snake_case para el servidor
    const serverData: any = {
      title: data.title,
      project_id: data.projectId, // El servidor espera project_id
      priority: data.priority,
    };
    
    if (data.description) serverData.description = data.description;
    if (data.dueDate) serverData.due_date = data.dueDate; // También puede ser due_date
    if (data.assignedTo) serverData.assigned_to = data.assignedTo; // Y assigned_to
    
    const response = await api.post('/tasks', serverData);
    return response.data;
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};

