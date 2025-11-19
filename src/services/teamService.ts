import api from './api';
import { TeamMembersResponse, TasksResponse } from '@/types';

export const teamService = {
  async getMembers(): Promise<TeamMembersResponse> {
    const response = await api.get('/team/members');
    return response.data;
  },

  async getMemberTasks(memberId: string): Promise<TasksResponse> {
    const response = await api.get(`/team/members/${memberId}/tasks`);
    return response.data;
  },
};

