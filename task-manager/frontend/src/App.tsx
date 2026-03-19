import { useState, useMemo, useCallback } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { TaskFiltersBar } from './components/TaskFiltersBar';
import { Modal } from './components/Modal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { sortTasks } from './utils/taskUtils';
import type { Task, TaskRequest, TaskFilters, SortField, SortOrder, TaskStatus } from './types/task';

export default function App() {
  const { tasks, categories, loading, error, fetchTasks, createTask, updateTask, deleteTask, clearError } = useTasks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleFiltersChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
    fetchTasks(newFilters);
  }, [fetchTasks]);

  const handleSortChange = useCallback((field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    fetchTasks();
  }, [fetchTasks]);

  const sortedTasks = useMemo(() => sortTasks(tasks, sortField, sortOrder), [tasks, sortField, sortOrder]);

  const handleCreate = useCallback(async (data: TaskRequest) => {
    await createTask(data);
    setShowCreateModal(false);
  }, [createTask]);

  const handleUpdate = useCallback(async (data: TaskRequest) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, data);
    setEditingTask(null);
  }, [editingTask, updateTask]);

  const handleStatusChange = useCallback(async (id: number, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await updateTask(id, {
      title: task.title,
      description: task.description,
      status,
      dueDate: task.dueDate,
      category: task.category,
    });
  }, [tasks, updateTask]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteTask(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteTask]);

  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {todoCount} todo · {inProgressCount} in progress · {doneCount} done
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span>+</span> New Task
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Global error */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center justify-between"
          >
            <span className="text-sm">{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-600 ml-4">✕</button>
          </div>
        )}

        {/* Filters */}
        <TaskFiltersBar
          filters={filters}
          sortField={sortField}
          sortOrder={sortOrder}
          categories={categories}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onReset={handleResetFilters}
        />

        {/* Task list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400" role="status" aria-live="polite">
            Loading tasks...
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tasks found.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-blue-600 hover:underline text-sm"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="grid gap-3" role="list" aria-label="Task list">
            {sortedTasks.map(task => (
              <div key={task.id} role="listitem">
                <TaskCard
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={(id) => setDeleteTarget(tasks.find(t => t.id === id) ?? null)}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create modal */}
      <Modal
        isOpen={showCreateModal}
        title="Create New Task"
        onClose={() => setShowCreateModal(false)}
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          categories={categories}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingTask}
        title="Edit Task"
        onClose={() => setEditingTask(null)}
      >
        {editingTask && (
          <TaskForm
            initialData={editingTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            categories={categories}
          />
        )}
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
