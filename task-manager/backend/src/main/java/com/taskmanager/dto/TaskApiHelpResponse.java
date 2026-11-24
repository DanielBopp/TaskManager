package com.taskmanager.dto;

import java.util.List;

public record TaskApiHelpResponse(String description, List<Endpoint> endpoints) {

    public TaskApiHelpResponse {
        endpoints = List.copyOf(endpoints);
    }

    public record Endpoint(String method, String path, String description) {
    }
}
