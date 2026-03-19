import type { Task, TaskStatus } from '../types/task';
import { STATUS_LABELS, STATUS_COLORS, STATUS_OPTIONS, formatDate, isDueSoon, isOverdue } from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  const dueSoon = isDueSoon(task.dueDate);

  return (
    <article
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
      data-testid="task-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-gray-900 truncate ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}
            title={task.title}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit task: ${task.title}`}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label={`Delete task: ${task.title}`}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Status dropdown */}
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          aria-label={`Change status for ${task.title}`}
          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[task.status]}`}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Category badge */}
        {task.category && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {task.category}
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              overdue
                ? 'bg-red-100 text-red-700 font-semibold'
                : dueSoon
                ? 'bg-yellow-100 text-yellow-700 font-semibold'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            📅 {formatDate(task.dueDate)}
            {overdue && ' (Overdue)'}
            {!overdue && dueSoon && ' (Soon)'}
          </span>
        )}
      </div>

      <div className="sr-only">
        Status: {STATUS_LABELS[task.status]}
      </div>
    </article>
  );
}
