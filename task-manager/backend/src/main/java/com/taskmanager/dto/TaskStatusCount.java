package com.taskmanager.dto;

import com.taskmanager.model.TaskStatus;

public record TaskStatusCount(TaskStatus status, Long count) {
}
