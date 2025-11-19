import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { taskService } from '@/services/taskService';
import { projectService } from '@/services/projectService';
import { teamService } from '@/services/teamService';
import { Task, Project, TeamMember, TaskFilters } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Plus, Filter, X, Edit, Trash2, CheckCircle } from 'lucide-react';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/utils/constants';
import { Toast } from '@/components/common/Toast';

export const Tasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    status: undefined,
    priority: undefined,
    projectId: undefined,
    assignedTo: undefined,
    page: 1,
    limit: 20,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'MEDIUM' as Task['priority'],
    dueDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    const initData = async () => {
      await Promise.all([
        loadProjects(),
        loadTeamMembers()
      ]);
      const taskId = searchParams.get('taskId');
      if (taskId) {
        loadTaskDetails(taskId);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters, currentPage]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks({
        ...filters,
        page: currentPage,
      });
      setTasks(response.tasks);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskDetails = async (taskId: string) => {
    try {
      const task = await taskService.getTask(taskId);
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedTo: task.assignedTo || '',
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading task details:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects({ limit: 100 });
      setProjects(response.projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      const response = await teamService.getMembers();
      setTeamMembers(response.members);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const handleCreate = async () => {
    // Validaciones básicas
    if (!formData.title.trim()) {
      setToast({ message: 'El título es requerido', type: 'error' });
      return;
    }
    
    if (!formData.projectId || formData.projectId.trim() === '') {
      setToast({ message: 'Debes seleccionar un proyecto', type: 'error' });
      return;
    }

    try {
      // Preparar los datos - taskService convertirá a snake_case
      const taskData: any = {
        title: formData.title.trim(),
        projectId: formData.projectId.trim(),
        priority: formData.priority,
      };

      // Agregar descripción solo si tiene valor
      if (formData.description?.trim()) {
        taskData.description = formData.description.trim();
      }

      // Agregar fecha solo si tiene valor Y está en formato correcto
      if (formData.dueDate?.trim()) {
        const dateValue = formData.dueDate.trim();
        // El input type="date" ya da formato YYYY-MM-DD, pero verificamos
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          taskData.dueDate = dateValue;
        }
      }

      // NO enviar assignedTo si no es válido - mejor crear sin asignar que fallar
      const assignedToValue = formData.assignedTo?.trim();
      if (assignedToValue && assignedToValue.length > 20 && assignedToValue !== '') {
        // Verificar que sea un UUID válido (contiene guiones o es muy largo)
        if (assignedToValue.includes('-') || assignedToValue.length >= 30) {
          taskData.assignedTo = assignedToValue;
        }
      }

      console.log('🚀 Datos finales a enviar:', taskData);

      await taskService.createTask(taskData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        projectId: '',
        priority: 'MEDIUM',
        dueDate: '',
        assignedTo: '',
      });
      setToast({ message: 'Tarea creada exitosamente', type: 'success' });
      loadTasks();
    } catch (error: any) {
      // Mostrar el error EXACTO del servidor
      console.error('❌ ERROR COMPLETO:', error);
      console.error('📦 Response data:', error.response?.data);
      console.error('📊 Status:', error.response?.status);
      
      let errorMessage = 'Error al crear la tarea';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Intentar obtener el mensaje más específico
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errors) {
          // Si hay múltiples errores
          if (Array.isArray(data.errors)) {
            errorMessage = data.errors.join(', ');
          } else if (typeof data.errors === 'object') {
            errorMessage = Object.values(data.errors).flat().join(', ');
          } else {
            errorMessage = String(data.errors);
          }
        } else {
          errorMessage = `Error ${error.response.status}: ${JSON.stringify(data)}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleUpdate = async () => {
    if (!selectedTask) return;
    if (!formData.title.trim() || !formData.projectId) {
      setToast({ message: 'Por favor completa todos los campos requeridos', type: 'error' });
      return;
    }
    try {
      await taskService.updateTask(selectedTask.id, {
        title: formData.title,
        description: formData.description || undefined,
        projectId: formData.projectId,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        assignedTo: formData.assignedTo || undefined,
      });
      setIsModalOpen(false);
      setSelectedTask(null);
      setToast({ message: 'Tarea actualizada exitosamente', type: 'success' });
      loadTasks();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Error al actualizar la tarea', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await taskService.deleteTask(taskToDelete);
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      setToast({ message: 'Tarea eliminada exitosamente', type: 'success' });
      loadTasks();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Error al eliminar la tarea', type: 'error' });
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      setToast({ message: 'Estado de tarea actualizado', type: 'success' });
      loadTasks();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Error al actualizar el estado', type: 'error' });
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      priority: task.priority,
      dueDate: task.dueDate || '',
      assignedTo: task.assignedTo || '',
    });
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      projectId: undefined,
      assignedTo: undefined,
      page: 1,
      limit: 20,
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    filters.status,
    filters.priority,
    filters.projectId,
    filters.assignedTo,
  ].filter(Boolean).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
              <p className="text-gray-600 mt-2">Gestiona todas tus tareas</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} className="mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-primary-600 text-white rounded-full px-2 py-0.5 text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <Button 
                data-create-task
                onClick={() => {
                  setSelectedTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    projectId: '',
                    priority: 'MEDIUM',
                    dueDate: '',
                    assignedTo: '',
                  });
                  setIsModalOpen(true);
                }}
              >
                <Plus size={20} className="mr-2" />
                Nueva Tarea
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as Task['status'] || undefined, page: 1 })}
                  >
                    <option value="">Todos</option>
                    {TASK_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.priority || ''}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value as Task['priority'] || undefined, page: 1 })}
                  >
                    <option value="">Todas</option>
                    {TASK_PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.projectId || ''}
                    onChange={(e) => setFilters({ ...filters, projectId: e.target.value || undefined, page: 1 })}
                  >
                    <option value="">Todos</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.assignedTo || ''}
                    onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value || undefined, page: 1 })}
                  >
                    <option value="">Todos</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X size={16} className="mr-2" />
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-12">No hay tareas. Crea una para comenzar.</p>
            </Card>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {tasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      loadTaskDetails(task.id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            TASK_PRIORITIES.find(p => p.value === task.priority)?.color || 'bg-gray-500'
                          } text-white`}>
                            {TASK_PRIORITIES.find(p => p.value === task.priority)?.label}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {task.project && (
                            <span 
                              className="hover:text-primary-600 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/projects/${task.projectId}`);
                              }}
                            >
                              📁 {task.project.name}
                            </span>
                          )}
                          {task.assignedUser && (
                            <span>👤 {task.assignedUser.name}</span>
                          )}
                          {task.dueDate && (
                            <span className={new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : ''}>
                              📅 {new Date(task.dueDate).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        >
                          {TASK_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                          title="Editar tarea"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setTaskToDelete(task.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar tarea"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
          setFormData({
            title: '',
            description: '',
            projectId: '',
            priority: 'MEDIUM',
            dueDate: '',
            assignedTo: '',
          });
        }}
        title={selectedTask ? 'Detalles de Tarea' : 'Crear Nueva Tarea'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                required
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Sin asignar</option>
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Cargando miembros...</option>
                )}
              </select>
            </div>
          </div>
          {selectedTask && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Estado actual:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    selectedTask.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    selectedTask.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {TASK_STATUSES.find(s => s.value === selectedTask.status)?.label}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Creada:</span>
                  <span className="ml-2 text-gray-600">
                    {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {selectedTask ? 'Cerrar' : 'Cancelar'}
            </Button>
            {selectedTask && (
              <Button onClick={handleUpdate}>
                Guardar Cambios
              </Button>
            )}
            {!selectedTask && (
              <Button onClick={handleCreate}>
                Crear Tarea
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        title="Eliminar Tarea"
      >
        <p className="text-gray-700 mb-4">
          ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

