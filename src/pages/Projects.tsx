import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { Project, Task } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Plus, Search, Edit, Trash2, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PROJECT_STATUSES } from '@/utils/constants';
import { Toast } from '@/components/common/Toast';

export const Projects: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as Project['status'],
  });

  useEffect(() => {
    if (id) {
      loadProjectDetails(id);
    } else {
      loadProjects();
    }
  }, [id, currentPage, searchTerm]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
      });
      setProjects(response.projects);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    try {
      setLoading(true);
      const [project, tasksRes] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getTasks({ projectId, limit: 100 }),
      ]);
      setSelectedProject(project);
      setProjectTasks(tasksRes.tasks);
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setToast({ message: 'Por favor ingresa un nombre para el proyecto', type: 'error' });
      return;
    }
    try {
      await projectService.createProject(formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', status: 'ACTIVE' });
      setToast({ message: 'Proyecto creado exitosamente', type: 'success' });
      loadProjects();
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Error al crear el proyecto', type: 'error' });
    }
  };

  const handleUpdate = async () => {
    if (!selectedProject) return;
    if (!formData.name.trim()) {
      setToast({ message: 'Por favor ingresa un nombre para el proyecto', type: 'error' });
      return;
    }
    try {
      await projectService.updateProject(selectedProject.id, formData);
      setIsModalOpen(false);
      setToast({ message: 'Proyecto actualizado exitosamente', type: 'success' });
      loadProjectDetails(selectedProject.id);
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Error al actualizar el proyecto', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await projectService.deleteProject(projectToDelete);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      setToast({ message: 'Proyecto eliminado exitosamente', type: 'success' });
      if (id) {
        navigate('/projects');
      } else {
        loadProjects();
      }
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Error al eliminar el proyecto', type: 'error' });
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
    });
    setIsModalOpen(true);
  };

  if (loading && !selectedProject) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  if (id && selectedProject) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="outline" onClick={() => navigate('/projects')} className="mb-6">
              <ArrowLeft size={18} className="mr-2" />
              Volver a Proyectos
            </Button>

            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedProject.name}</h1>
                  <p className="text-gray-600 mt-2">{selectedProject.description || 'Sin descripción'}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => openEditModal(selectedProject)}>
                    <Edit size={18} className="mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setProjectToDelete(selectedProject.id);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 size={18} className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  PROJECT_STATUSES.find(s => s.value === selectedProject.status)?.color || 'bg-gray-500'
                } text-white`}>
                  {PROJECT_STATUSES.find(s => s.value === selectedProject.status)?.label}
                </span>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tareas del Proyecto</h2>
              {projectTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay tareas en este proyecto</p>
              ) : (
                <div className="space-y-3">
                  {projectTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tasks?taskId=${task.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{task.description || 'Sin descripción'}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'COMPLETED' ? 'Completada' :
                           task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Por Hacer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
            setFormData({ name: '', description: '', status: 'ACTIVE' });
          }}
          title={selectedProject ? 'Editar Proyecto' : 'Crear Proyecto'}
        >
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={selectedProject ? handleUpdate : handleCreate}>
                {selectedProject ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
          }}
          title="Eliminar Proyecto"
        >
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
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
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
              <p className="text-gray-600 mt-2">Gestiona todos tus proyectos</p>
            </div>
            <Button onClick={() => {
              setSelectedProject(null);
              setFormData({ name: '', description: '', status: 'ACTIVE' });
              setIsModalOpen(true);
            }}>
              <Plus size={20} className="mr-2" />
              Nuevo Proyecto
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-12">No hay proyectos. Crea uno para comenzar.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        PROJECT_STATUSES.find(s => s.value === project.status)?.color || 'bg-gray-500'
                      } text-white`}>
                        {PROJECT_STATUSES.find(s => s.value === project.status)?.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || 'Sin descripción'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {project.tasks?.length || 0} tareas
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(project);
                          }}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
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
          setSelectedProject(null);
          setFormData({ name: '', description: '', status: 'ACTIVE' });
        }}
        title={selectedProject ? 'Editar Proyecto' : 'Crear Proyecto'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={selectedProject ? handleUpdate : handleCreate}>
              {selectedProject ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        title="Eliminar Proyecto"
      >
        <p className="text-gray-700 mb-4">
          ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
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

