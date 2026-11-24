package com.taskmanager.controller;

import com.taskmanager.dto.TaskApiHelpResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.dto.TaskSummaryResponse;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String category) {

        if (search != null || status != null || category != null) {
            return ResponseEntity.ok(taskService.searchTasks(search, status, category));
        }
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/summary")
    public ResponseEntity<TaskSummaryResponse> getTaskSummary() {
        return ResponseEntity.ok(taskService.getTaskSummary());
    }

    @GetMapping("/schema")
    public ResponseEntity<Map<String, Object>> getTaskSchema() {
        return ResponseEntity.ok(taskService.getTaskSchema());
    }

    @GetMapping("/help")
    public ResponseEntity<TaskApiHelpResponse> getApiHelp() {
        return ResponseEntity.ok(new TaskApiHelpResponse(
                "Task Manager REST API. Base path: /api.",
                List.of(
                        new TaskApiHelpResponse.Endpoint("GET", "/api/tasks",
                                "List tasks; optional search, status, and category filters."),
                        new TaskApiHelpResponse.Endpoint("GET", "/api/tasks/summary",
                                "Return task counts grouped by status."),
                        new TaskApiHelpResponse.Endpoint("GET", "/api/tasks/schema",
                                "Return the simplified JSON Schema for tasks."),
                        new TaskApiHelpResponse.Endpoint("GET", "/api/tasks/{id}",
                                "Return one task by ID."),
                        new TaskApiHelpResponse.Endpoint("POST", "/api/tasks",
                                "Create a task from TaskRequest JSON."),
                        new TaskApiHelpResponse.Endpoint("PUT", "/api/tasks/{id}",
                                "Update a task from TaskRequest JSON."),
                        new TaskApiHelpResponse.Endpoint("DELETE", "/api/tasks/{id}",
                                "Delete a task by ID."),
                        new TaskApiHelpResponse.Endpoint("GET", "/api/tasks/categories",
                                "Return all task categories."),
                        new TaskApiHelpResponse.Endpoint("GET", "/api/tasks/help",
                                "Return this endpoint catalog.")
                )));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(taskService.getAllCategories());
    }
}
