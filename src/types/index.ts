export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  createdAt?: string;
  updatedAt?: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectId: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  project?: Project;
  assignedUser?: User;
}

export interface ProjectsResponse {
  projects: Project[];
  totalPages: number;
  currentPage: number;
}

export interface TasksResponse {
  tasks: Task[];
  totalPages: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export interface TeamMembersResponse {
  members: TeamMember[];
}

export interface TaskFilters {
  projectId?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
}

