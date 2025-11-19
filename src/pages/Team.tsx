import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamService } from '@/services/teamService';
import { taskService } from '@/services/taskService';
import { TeamMember, Task } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Users, CheckSquare, User, ArrowRight, Calendar } from 'lucide-react';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/utils/constants';

export const Team: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberTasks, setMemberTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await teamService.getMembers();
      setMembers(response.members);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberTasks = async (memberId: string) => {
    try {
      setTasksLoading(true);
      const response = await teamService.getMemberTasks(memberId);
      setMemberTasks(response.tasks);
    } catch (error) {
      console.error('Error loading member tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleMemberClick = async (member: TeamMember) => {
    setSelectedMember(member);
    await loadMemberTasks(member.id);
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Equipo</h1>
              <p className="text-gray-600 mt-2">Visualiza los miembros del equipo y sus tareas asignadas</p>
            </div>
            <Button onClick={() => navigate('/tasks')}>
              Ver Todas las Tareas
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <div className="flex items-center space-x-2 mb-6">
                  <Users className="text-primary-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-900">Miembros del Equipo</h2>
                </div>
                {members.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay miembros en el equipo</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleMemberClick(member)}
                        className={`
                          p-4 rounded-lg cursor-pointer transition-all
                          ${selectedMember?.id === member.id
                            ? 'bg-primary-50 border-2 border-primary-600'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2">
              {selectedMember ? (
                <Card>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {selectedMember.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{selectedMember.name}</h2>
                      <p className="text-gray-600">{selectedMember.email}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckSquare size={20} className="mr-2" />
                      Tareas Asignadas ({memberTasks.length})
                    </h3>
                  </div>

                  {tasksLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : memberTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckSquare className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Este miembro no tiene tareas asignadas</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => navigate('/tasks')}
                      >
                        Crear Tarea
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {memberTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-primary-200"
                          onClick={() => navigate(`/tasks?taskId=${task.id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  TASK_PRIORITIES.find(p => p.value === task.priority)?.color || 'bg-gray-500'
                                } text-white`}>
                                  {TASK_PRIORITIES.find(p => p.value === task.priority)?.label}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                {task.project && (
                                  <span 
                                    className="hover:text-primary-600 cursor-pointer flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/projects/${task.projectId}`);
                                    }}
                                  >
                                    📁 {task.project.name}
                                  </span>
                                )}
                                {task.dueDate && (
                                  <span className={`flex items-center ${
                                    new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' 
                                      ? 'text-red-600 font-medium' 
                                      : ''
                                  }`}>
                                    <Calendar size={14} className="mr-1" />
                                    {new Date(task.dueDate).toLocaleDateString('es-ES')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2 ml-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {TASK_STATUSES.find(s => s.value === task.status)?.label}
                              </span>
                              <ArrowRight className="text-gray-400" size={16} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-12">
                    <User className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">Selecciona un miembro del equipo para ver sus tareas</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

