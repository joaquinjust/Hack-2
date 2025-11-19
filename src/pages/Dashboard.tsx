import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Navbar } from '@/components/layout/Navbar';
import { Task, Project } from '@/types';
import { CheckCircle, Clock, AlertCircle, Plus, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        taskService.getTasks({ limit: 100 }),
        projectService.getProjects({ limit: 5 }),
      ]);

      const tasks = tasksRes.tasks;
      const now = new Date();

      const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
      const pending = tasks.filter((t) => t.status !== 'COMPLETED').length;
      const overdue = tasks.filter(
        (t) => {
          if (!t.dueDate || t.status === 'COMPLETED') return false;
          return new Date(t.dueDate) < now;
        })
      .length;

      setStats({
        total: tasks.length,
        completed,
        pending,
        overdue,
      });

      setRecentTasks(tasks.slice(0, 5));
      setRecentProjects(projectsRes.projects);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Vista general de tus proyectos y tareas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Tareas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-primary-600" size={24} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completadas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vencidas</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Tareas Recientes</h2>
                <Button size="sm" onClick={() => navigate('/tasks')}>
                  Ver todas
                </Button>
              </div>
              {recentTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay tareas recientes</p>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tasks?taskId=${task.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">{task.project?.name || 'Sin proyecto'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'COMPLETED' ? 'Completada' :
                         task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Por Hacer'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Proyectos Recientes</h2>
                <Button size="sm" onClick={() => navigate('/projects')}>
                  Ver todos
                </Button>
              </div>
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay proyectos</p>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.description || 'Sin descripción'}</p>
                      </div>
                      <ArrowRight className="text-gray-400" size={20} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Button onClick={() => {
              navigate('/tasks');
              setTimeout(() => {
                const button = document.querySelector('[data-create-task]') as HTMLButtonElement;
                if (button) button.click();
              }, 100);
            }} size="lg">
              <Plus size={20} className="mr-2" />
              Crear Nueva Tarea
            </Button>
            <Button variant="outline" onClick={() => navigate('/projects')} size="lg">
              Ver Proyectos
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

