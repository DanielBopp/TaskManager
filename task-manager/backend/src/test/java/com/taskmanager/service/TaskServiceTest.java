package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;
    private TaskRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleTask = Task.builder()
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
    @DisplayName("getAllTasks")
    class GetAllTasksTests {

        @Test
        @DisplayName("returns empty list when no tasks exist")
        void returnsEmptyList() {
            when(taskRepository.findAll()).thenReturn(List.of());
            List<TaskResponse> result = taskService.getAllTasks();
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("returns all tasks as responses")
        void returnsAllTasks() {
            Task second = Task.builder().id(2L).title("Second").status(TaskStatus.DONE).build();
            when(taskRepository.findAll()).thenReturn(List.of(sampleTask, second));

            List<TaskResponse> result = taskService.getAllTasks();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(TaskResponse::getId).containsExactly(1L, 2L);
        }

        @Test
        @DisplayName("maps all fields correctly")
        void mapsFieldsCorrectly() {
            when(taskRepository.findAll()).thenReturn(List.of(sampleTask));
            List<TaskResponse> result = taskService.getAllTasks();

            TaskResponse response = result.get(0);
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getTitle()).isEqualTo("Sample Task");
            assertThat(response.getDescription()).isEqualTo("Sample description");
            assertThat(response.getStatus()).isEqualTo(TaskStatus.TODO);
            assertThat(response.getDueDate()).isEqualTo(LocalDateTime.of(2026, 4, 1, 0, 0));
            assertThat(response.getCategory()).isEqualTo("Work");
        }
    }

    @Nested
    @DisplayName("getTaskById")
    class GetTaskByIdTests {

        @Test
        @DisplayName("returns task when found")
        void returnsTaskWhenFound() {
            when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

            TaskResponse result = taskService.getTaskById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getTitle()).isEqualTo("Sample Task");
        }

        @Test
        @DisplayName("throws TaskNotFoundException when not found")
        void throwsNotFound() {
            when(taskRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.getTaskById(99L))
                    .isInstanceOf(TaskNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    @Nested
    @DisplayName("createTask")
    class CreateTaskTests {

        @Test
        @DisplayName("creates and returns task with generated id")
        void createsTask() {
            when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

            TaskResponse result = taskService.createTask(sampleRequest);

            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getTitle()).isEqualTo("Sample Task");
            assertThat(result.getStatus()).isEqualTo(TaskStatus.TODO);
        }

        @Test
        @DisplayName("maps all fields from request to entity")
        void mapsAllFields() {
            when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
                Task t = invocation.getArgument(0);
                t = Task.builder()
                        .id(10L)
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .status(t.getStatus())
                        .dueDate(t.getDueDate())
                        .category(t.getCategory())
                        .build();
                return t;
            });

            TaskResponse result = taskService.createTask(sampleRequest);

            assertThat(result.getTitle()).isEqualTo("Sample Task");
            assertThat(result.getDescription()).isEqualTo("Sample description");
            assertThat(result.getStatus()).isEqualTo(TaskStatus.TODO);
            assertThat(result.getDueDate()).isEqualTo(LocalDateTime.of(2026, 4, 1, 0, 0));
            assertThat(result.getCategory()).isEqualTo("Work");
        }

        @Test
        @DisplayName("creates task without optional fields")
        void createsTaskWithoutOptionalFields() {
            TaskRequest minimalRequest = TaskRequest.builder()
                    .title("Minimal Task")
                    .status(TaskStatus.TODO)
                    .build();
            Task minimalTask = Task.builder().id(2L).title("Minimal Task").status(TaskStatus.TODO).build();
            when(taskRepository.save(any(Task.class))).thenReturn(minimalTask);

            TaskResponse result = taskService.createTask(minimalRequest);

            assertThat(result.getTitle()).isEqualTo("Minimal Task");
            assertThat(result.getDescription()).isNull();
            assertThat(result.getDueDate()).isNull();
            assertThat(result.getCategory()).isNull();
        }

        @Test
        @DisplayName("persists task via repository")
        void callsRepositorySave() {
            when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);
            taskService.createTask(sampleRequest);
            verify(taskRepository, times(1)).save(any(Task.class));
        }
    }

    @Nested
    @DisplayName("updateTask")
    class UpdateTaskTests {

        @Test
        @DisplayName("updates existing task successfully")
        void updatesTask() {
            TaskRequest updateRequest = TaskRequest.builder()
                    .title("Updated Title")
                    .description("Updated desc")
                    .status(TaskStatus.IN_PROGRESS)
                    .build();

            Task updatedTask = Task.builder()
                    .id(1L)
                    .title("Updated Title")
                    .description("Updated desc")
                    .status(TaskStatus.IN_PROGRESS)
                    .build();

            when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
            when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

            TaskResponse result = taskService.updateTask(1L, updateRequest);

            assertThat(result.getTitle()).isEqualTo("Updated Title");
            assertThat(result.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
        }

        @Test
        @DisplayName("throws TaskNotFoundException when updating non-existent task")
        void throwsNotFoundOnUpdate() {
            when(taskRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.updateTask(99L, sampleRequest))
                    .isInstanceOf(TaskNotFoundException.class)
                    .hasMessageContaining("99");
        }

        @Test
        @DisplayName("calls repository save during update")
        void callsSaveOnUpdate() {
            when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
            when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

            taskService.updateTask(1L, sampleRequest);

            verify(taskRepository).save(any(Task.class));
        }
    }

    @Nested
    @DisplayName("deleteTask")
    class DeleteTaskTests {

        @Test
        @DisplayName("deletes existing task without error")
        void deletesTask() {
            when(taskRepository.existsById(1L)).thenReturn(true);
            doNothing().when(taskRepository).deleteById(1L);

            assertThatCode(() -> taskService.deleteTask(1L)).doesNotThrowAnyException();
            verify(taskRepository).deleteById(1L);
        }

        @Test
        @DisplayName("throws TaskNotFoundException when deleting non-existent task")
        void throwsNotFoundOnDelete() {
            when(taskRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> taskService.deleteTask(99L))
                    .isInstanceOf(TaskNotFoundException.class)
                    .hasMessageContaining("99");
            verify(taskRepository, never()).deleteById(any());
        }
    }

    @Nested
    @DisplayName("searchTasks")
    class SearchTasksTests {

        @Test
        @DisplayName("returns matching tasks")
        void returnsMatchingTasks() {
            when(taskRepository.searchTasks(eq("Sample"), isNull(), isNull()))
                    .thenReturn(List.of(sampleTask));

            List<TaskResponse> result = taskService.searchTasks("Sample", null, null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("Sample Task");
        }

        @Test
        @DisplayName("returns empty list when no matches")
        void returnsEmptyListWhenNoMatch() {
            when(taskRepository.searchTasks(eq("xyz"), isNull(), isNull()))
                    .thenReturn(List.of());

            List<TaskResponse> result = taskService.searchTasks("xyz", null, null);
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("uses empty string when search is null")
        void usesEmptyStringForNullSearch() {
            when(taskRepository.searchTasks(eq(""), isNull(), isNull()))
                    .thenReturn(List.of(sampleTask));

            List<TaskResponse> result = taskService.searchTasks(null, null, null);
            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("getAllCategories")
    class GetAllCategoriesTests {

        @Test
        @DisplayName("returns distinct categories")
        void returnsCategories() {
            when(taskRepository.findAllCategories()).thenReturn(List.of("Work", "Personal"));

            List<String> categories = taskService.getAllCategories();

            assertThat(categories).containsExactly("Work", "Personal");
        }

        @Test
        @DisplayName("returns empty list when no categories")
        void returnsEmptyList() {
            when(taskRepository.findAllCategories()).thenReturn(List.of());
            assertThat(taskService.getAllCategories()).isEmpty();
        }
    }
}
