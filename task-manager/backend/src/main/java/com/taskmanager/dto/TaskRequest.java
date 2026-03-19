package com.taskmanager.dto;

import com.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class TaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    private LocalDateTime dueDate;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    public TaskRequest() {}

    public TaskRequest(String title, String description, TaskStatus status, LocalDateTime dueDate, String category) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.category = category;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String title;
        private String description;
        private TaskStatus status;
        private LocalDateTime dueDate;
        private String category;

        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(TaskStatus status) { this.status = status; return this; }
        public Builder dueDate(LocalDateTime dueDate) { this.dueDate = dueDate; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public TaskRequest build() { return new TaskRequest(title, description, status, dueDate, category); }
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
