package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.exception.GlobalExceptionHandler;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {TaskController.class, GlobalExceptionHandler.class})
@DisplayName("TaskController Integration Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    private ObjectMapper objectMapper;
    private TaskResponse sampleResponse;
    private TaskRequest sampleRequest;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        sampleResponse = TaskResponse.builder()
                .id(1L)
                .title("Sample Task")
                .description("Sample description")
                .status(TaskStatus.TODO)
                .dueDate(LocalDateTime.of(2026, 4, 1, 0, 0))
                .category("Work")
                .build();

        sampleRequest = TaskRequest.builder()
                .title("Sample Task")
                .description("Sample description")
                .status(TaskStatus.TODO)
                .dueDate(LocalDateTime.of(2026, 4, 1, 0, 0))
                .category("Work")
                .build();
    }

    @Nested
    @DisplayName("GET /api/tasks")
    class GetAllTasksTests {

        @Test
        @DisplayName("returns 200 with list of tasks")
        void returnsAllTasks() throws Exception {
            when(taskService.getAllTasks()).thenReturn(List.of(sampleResponse));

            mockMvc.perform(get("/api/tasks"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].title").value("Sample Task"))
                    .andExpect(jsonPath("$[0].status").value("TODO"));
        }

        @Test
        @DisplayName("returns 200 with empty list when no tasks")
        void returnsEmptyList() throws Exception {
            when(taskService.getAllTasks()).thenReturn(List.of());

            mockMvc.perform(get("/api/tasks"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }

        @Test
        @DisplayName("delegates to searchTasks when search param provided")
        void usesSearchWhenParamPresent() throws Exception {
            when(taskService.searchTasks(eq("test"), isNull(), isNull()))
                    .thenReturn(List.of(sampleResponse));

            mockMvc.perform(get("/api/tasks").param("search", "test"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));

            verify(taskService).searchTasks("test", null, null);
            verify(taskService, never()).getAllTasks();
        }

        @Test
        @DisplayName("delegates to searchTasks when status param provided")
        void usesSearchWhenStatusParamPresent() throws Exception {
            when(taskService.searchTasks(isNull(), eq(TaskStatus.TODO), isNull()))
                    .thenReturn(List.of(sampleResponse));

            mockMvc.perform(get("/api/tasks").param("status", "TODO"))
                    .andExpect(status().isOk());

            verify(taskService).searchTasks(null, TaskStatus.TODO, null);
        }
    }

    @Nested
    @DisplayName("GET /api/tasks/{id}")
    class GetTaskByIdTests {

        @Test
        @DisplayName("returns 200 with task when found")
        void returnsTask() throws Exception {
            when(taskService.getTaskById(1L)).thenReturn(sampleResponse);

            mockMvc.perform(get("/api/tasks/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.title").value("Sample Task"))
                    .andExpect(jsonPath("$.category").value("Work"));
        }

        @Test
        @DisplayName("returns 404 when task not found")
        void returns404WhenNotFound() throws Exception {
            when(taskService.getTaskById(99L)).thenThrow(new TaskNotFoundException(99L));

            mockMvc.perform(get("/api/tasks/99"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status").value(404))
                    .andExpect(jsonPath("$.message").value("Task not found with id: 99"));
        }
    }

    @Nested
    @DisplayName("POST /api/tasks")
    class CreateTaskTests {

        @Test
        @DisplayName("returns 201 with created task")
        void createsTask() throws Exception {
            when(taskService.createTask(any(TaskRequest.class))).thenReturn(sampleResponse);

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.title").value("Sample Task"));
        }

        @Test
        @DisplayName("returns 400 when title is blank")
        void returns400WhenTitleBlank() throws Exception {
            TaskRequest invalidRequest = TaskRequest.builder()
                    .title("")
                    .status(TaskStatus.TODO)
                    .build();

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status").value(400));
        }

        @Test
        @DisplayName("returns 400 when title exceeds 100 characters")
        void returns400WhenTitleTooLong() throws Exception {
            TaskRequest invalidRequest = TaskRequest.builder()
                    .title("A".repeat(101))
                    .status(TaskStatus.TODO)
                    .build();

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("returns 400 when status is missing")
        void returns400WhenStatusMissing() throws Exception {
            String body = "{\"title\":\"Test\"}";

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("returns 400 when description exceeds 500 characters")
        void returns400WhenDescriptionTooLong() throws Exception {
            TaskRequest invalidRequest = TaskRequest.builder()
                    .title("Valid Title")
                    .description("D".repeat(501))
                    .status(TaskStatus.TODO)
                    .build();

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/tasks/{id}")
    class UpdateTaskTests {

        @Test
        @DisplayName("returns 200 with updated task")
        void updatesTask() throws Exception {
            TaskResponse updated = TaskResponse.builder()
                    .id(1L).title("Updated").status(TaskStatus.IN_PROGRESS).build();
            when(taskService.updateTask(eq(1L), any(TaskRequest.class))).thenReturn(updated);

            mockMvc.perform(put("/api/tasks/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Updated"))
                    .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        }

        @Test
        @DisplayName("returns 404 when task not found")
        void returns404WhenNotFound() throws Exception {
            when(taskService.updateTask(eq(99L), any(TaskRequest.class)))
                    .thenThrow(new TaskNotFoundException(99L));

            mockMvc.perform(put("/api/tasks/99")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleRequest)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("returns 400 when update request is invalid")
        void returns400WhenInvalid() throws Exception {
            TaskRequest invalid = TaskRequest.builder().title("").status(TaskStatus.DONE).build();

            mockMvc.perform(put("/api/tasks/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/tasks/{id}")
    class DeleteTaskTests {

        @Test
        @DisplayName("returns 204 when deleted successfully")
        void deletesTask() throws Exception {
            doNothing().when(taskService).deleteTask(1L);

            mockMvc.perform(delete("/api/tasks/1"))
                    .andExpect(status().isNoContent());

            verify(taskService).deleteTask(1L);
        }

        @Test
        @DisplayName("returns 404 when task not found")
        void returns404WhenNotFound() throws Exception {
            doThrow(new TaskNotFoundException(99L)).when(taskService).deleteTask(99L);

            mockMvc.perform(delete("/api/tasks/99"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/tasks/categories")
    class GetCategoriesTests {

        @Test
        @DisplayName("returns 200 with list of categories")
        void returnsCategories() throws Exception {
            when(taskService.getAllCategories()).thenReturn(List.of("Work", "Personal", "Hobby"));

            mockMvc.perform(get("/api/tasks/categories"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3))
                    .andExpect(jsonPath("$[0]").value("Work"));
        }
    }
}
