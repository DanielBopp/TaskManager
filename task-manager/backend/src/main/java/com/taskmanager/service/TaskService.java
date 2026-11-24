package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.TaskStatusCount;
import com.taskmanager.dto.TaskSummaryResponse;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        return toResponse(task);
    }

    public TaskResponse createTask(TaskRequest request) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .dueDate(request.getDueDate())
                .category(request.getCategory())
                .build();
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setCategory(request.getCategory());

        Task updated = taskRepository.save(task);
        return toResponse(updated);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException(id);
        }
        taskRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> searchTasks(String search, TaskStatus status, String category) {
        String searchTerm = (search == null) ? "" : search;
        return taskRepository.searchTasks(searchTerm, status, category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return taskRepository.findAllCategories();
    }

    @Transactional(readOnly = true)
    public TaskSummaryResponse getTaskSummary() {
        Map<TaskStatus, Long> tasksByStatus = new EnumMap<>(TaskStatus.class);
        for (TaskStatus status : TaskStatus.values()) {
            tasksByStatus.put(status, 0L);
        }

        for (TaskStatusCount statusCount : taskRepository.countTasksByStatus()) {
            tasksByStatus.put(statusCount.status(), statusCount.count());
        }

        long totalTasks = tasksByStatus.values().stream()
                .mapToLong(Long::longValue)
                .sum();
        return new TaskSummaryResponse(totalTasks, tasksByStatus);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTaskSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("id", Map.of("type", "integer", "format", "int64", "readOnly", true));
        properties.put("title", Map.of("type", "string", "maxLength", 100));
        properties.put("description", Map.of("type", List.of("string", "null"), "maxLength", 500));
        properties.put("status", Map.of(
                "type", "string",
                "enum", List.of(TaskStatus.values()).stream().map(Enum::name).toList()));
        properties.put("dueDate", Map.of("type", List.of("string", "null"), "format", "date-time"));
        properties.put("category", Map.of("type", List.of("string", "null"), "maxLength", 100));

        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("$schema", "https://json-schema.org/draft/2020-12/schema");
        schema.put("title", "Task");
        schema.put("type", "object");
        schema.put("properties", properties);
        schema.put("required", List.of("title", "status"));
        return schema;
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .category(task.getCategory())
                .build();
    }
}
