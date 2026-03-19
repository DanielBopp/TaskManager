package com.taskmanager.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Task API Full Integration Tests")
class TaskIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Test
    @DisplayName("full CRUD lifecycle: create → read → update → delete")
    void fullCrudLifecycle() throws Exception {
        // CREATE
        TaskRequest createRequest = TaskRequest.builder()
                .title("Integration Test Task")
                .description("Test description")
                .status(TaskStatus.TODO)
                .dueDate(LocalDateTime.of(2026, 5, 1, 0, 0))
                .category("Testing")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Integration Test Task"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(responseBody).get("id").asLong();

        // READ by ID
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId))
                .andExpect(jsonPath("$.title").value("Integration Test Task"));

        // READ all
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        // UPDATE
        TaskRequest updateRequest = TaskRequest.builder()
                .title("Updated Integration Task")
                .description("Updated description")
                .status(TaskStatus.IN_PROGRESS)
                .dueDate(LocalDateTime.of(2026, 5, 15, 0, 0))
                .category("Testing")
                .build();

        mockMvc.perform(put("/api/tasks/" + taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Integration Task"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // DELETE
        mockMvc.perform(delete("/api/tasks/" + taskId))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/tasks/" + taskId))
                .andExpect(status().isNotFound());

        assertThat(taskRepository.count()).isZero();
    }

    @Test
    @DisplayName("search filters tasks correctly")
    void searchFiltersCorrectly() throws Exception {
        // Setup tasks
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(TaskRequest.builder()
                        .title("Work task alpha").status(TaskStatus.TODO).category("Work").build())));

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(TaskRequest.builder()
                        .title("Personal task beta").status(TaskStatus.DONE).category("Personal").build())));

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TaskRequest.builder()
                                .title("Work task beta").status(TaskStatus.TODO).category("Work").build())))
                .andExpect(status().isCreated());

        // Search by keyword
        mockMvc.perform(get("/api/tasks").param("search", "alpha"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        // Filter by status
        mockMvc.perform(get("/api/tasks").param("status", "TODO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        // Filter by category
        mockMvc.perform(get("/api/tasks").param("category", "Work"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("returns categories from existing tasks")
    void returnsCategories() throws Exception {
        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(TaskRequest.builder()
                        .title("T1").status(TaskStatus.TODO).category("Work").build())));

        mockMvc.perform(post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(TaskRequest.builder()
                        .title("T2").status(TaskStatus.TODO).category("Personal").build())));

        mockMvc.perform(get("/api/tasks/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("returns 400 for missing title on create")
    void returns400ForMissingTitle() throws Exception {
        String body = "{\"status\":\"TODO\"}";
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    @DisplayName("returns 404 for non-existent task id")
    void returns404ForNonExistent() throws Exception {
        mockMvc.perform(get("/api/tasks/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Task not found with id: 9999"));
    }

    @Test
    @DisplayName("persists task status change correctly")
    void persistsStatusChange() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TaskRequest.builder()
                                .title("Status Test").status(TaskStatus.TODO).build())))
                .andExpect(status().isCreated())
                .andReturn();

        Long id = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/tasks/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(TaskRequest.builder()
                                .title("Status Test").status(TaskStatus.DONE).build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));
    }
}
