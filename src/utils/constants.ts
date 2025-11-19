import type { Task, Project } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cs2031-2025-2-hackathon-2-backend-production.up.railway.app/v1';

export const STORAGE_KEYS = {
  TOKEN: 'techflow_token',
  USER: 'techflow_user',
};

export const TASK_STATUSES: Array<{ value: Task['status']; label: string; color: string }> = [
  { value: 'TODO', label: 'Por Hacer', color: 'bg-gray-500' },
  { value: 'IN_PROGRESS', label: 'En Progreso', color: 'bg-blue-500' },
  { value: 'COMPLETED', label: 'Completada', color: 'bg-green-500' },
];

export const TASK_PRIORITIES: Array<{ value: Task['priority']; label: string; color: string }> = [
  { value: 'LOW', label: 'Baja', color: 'bg-gray-400' },
  { value: 'MEDIUM', label: 'Media', color: 'bg-yellow-500' },
  { value: 'HIGH', label: 'Alta', color: 'bg-orange-500' },
  { value: 'URGENT', label: 'Urgente', color: 'bg-red-500' },
];

export const PROJECT_STATUSES: Array<{ value: Project['status']; label: string; color: string }> = [
  { value: 'ACTIVE', label: 'Activo', color: 'bg-green-500' },
  { value: 'COMPLETED', label: 'Completado', color: 'bg-blue-500' },
  { value: 'ON_HOLD', label: 'En Pausa', color: 'bg-yellow-500' },
];

