package com.taskmanager.dto;

import com.taskmanager.model.TaskStatus;

import java.util.EnumMap;
import java.util.Map;

public class TaskSummaryResponse {

    private final long totalTasks;
    private final Map<TaskStatus, Long> tasksByStatus;

    public TaskSummaryResponse(long totalTasks, Map<TaskStatus, Long> tasksByStatus) {
        this.totalTasks = totalTasks;
        this.tasksByStatus = new EnumMap<>(TaskStatus.class);
        this.tasksByStatus.putAll(tasksByStatus);
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public Map<TaskStatus, Long> getTasksByStatus() {
        return tasksByStatus;
    }
}
