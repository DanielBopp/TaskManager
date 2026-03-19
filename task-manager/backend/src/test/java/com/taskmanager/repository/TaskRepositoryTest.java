package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("TaskRepository Integration Tests")
class TaskRepositoryTest {

    @Autowired
    private TaskRepository taskRepository;

    private Task todoTask;
    private Task inProgressTask;
    private Task doneTask;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();

        todoTask = taskRepository.save(Task.builder()
                .title("Buy groceries")
                .description("Milk, eggs, bread")
                .status(TaskStatus.TODO)
                .dueDate(LocalDateTime.of(2026, 3, 25, 0, 0))
                .category("Personal")
                .build());

        inProgressTask = taskRepository.save(Task.builder()
                .title("Write unit tests")
                .description("Tests for TaskService")
                .status(TaskStatus.IN_PROGRESS)
                .dueDate(LocalDateTime.of(2026, 3, 20, 0, 0))
                .category("Work")
                .build());

        doneTask = taskRepository.save(Task.builder()
                .title("Setup project")
                .description("Initialize Spring Boot project")
                .status(TaskStatus.DONE)
                .dueDate(LocalDateTime.of(2026, 3, 15, 0, 0))
                .category("Work")
                .build());
    }

    @Nested
    @DisplayName("CRUD Operations")
    class CrudTests {

        @Test
        @DisplayName("saves and retrieves a task by id")
        void savesAndRetrievesTask() {
            Optional<Task> found = taskRepository.findById(todoTask.getId());
            assertThat(found).isPresent();
            assertThat(found.get().getTitle()).isEqualTo("Buy groceries");
        }

        @Test
        @DisplayName("finds all tasks")
        void findsAllTasks() {
            assertThat(taskRepository.findAll()).hasSize(3);
        }

        @Test
        @DisplayName("deletes a task by id")
        void deletesTask() {
            taskRepository.deleteById(todoTask.getId());
            assertThat(taskRepository.findById(todoTask.getId())).isEmpty();
            assertThat(taskRepository.findAll()).hasSize(2);
        }

        @Test
        @DisplayName("updates a task")
        void updatesTask() {
            todoTask.setStatus(TaskStatus.DONE);
            todoTask.setTitle("Updated Title");
            taskRepository.save(todoTask);

            Task updated = taskRepository.findById(todoTask.getId()).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(TaskStatus.DONE);
            assertThat(updated.getTitle()).isEqualTo("Updated Title");
        }

        @Test
        @DisplayName("auto-generates id on save")
        void autoGeneratesId() {
            assertThat(todoTask.getId()).isNotNull();
            assertThat(inProgressTask.getId()).isNotNull();
            assertThat(todoTask.getId()).isNotEqualTo(inProgressTask.getId());
        }
    }

    @Nested
    @DisplayName("findByStatus")
    class FindByStatusTests {

        @Test
        @DisplayName("finds all TODO tasks")
        void findsTodoTasks() {
            List<Task> result = taskRepository.findByStatus(TaskStatus.TODO);
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("Buy groceries");
        }

        @Test
        @DisplayName("finds all IN_PROGRESS tasks")
        void findsInProgressTasks() {
            List<Task> result = taskRepository.findByStatus(TaskStatus.IN_PROGRESS);
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("Write unit tests");
        }

        @Test
        @DisplayName("finds all DONE tasks")
        void findsDoneTasks() {
            List<Task> result = taskRepository.findByStatus(TaskStatus.DONE);
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("returns empty list when no tasks match status")
        void returnsEmptyList() {
            taskRepository.deleteAll();
            List<Task> result = taskRepository.findByStatus(TaskStatus.TODO);
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByCategory")
    class FindByCategoryTests {

        @Test
        @DisplayName("finds tasks by category")
        void findsByCategory() {
            List<Task> workTasks = taskRepository.findByCategory("Work");
            assertThat(workTasks).hasSize(2);
        }

        @Test
        @DisplayName("returns empty list for unknown category")
        void returnsEmptyForUnknownCategory() {
            List<Task> result = taskRepository.findByCategory("Nonexistent");
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("searchTasks")
    class SearchTasksTests {

        @Test
        @DisplayName("finds tasks by title keyword")
        void findsByTitleKeyword() {
            List<Task> result = taskRepository.searchTasks("groceries", null, null);
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("Buy groceries");
        }

        @Test
        @DisplayName("search is case-insensitive")
        void searchIsCaseInsensitive() {
            List<Task> result = taskRepository.searchTasks("GROCERIES", null, null);
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("finds tasks by status filter")
        void findsByStatusFilter() {
            List<Task> result = taskRepository.searchTasks("", TaskStatus.TODO, null);
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("finds tasks by category filter")
        void findsByCategoryFilter() {
            List<Task> result = taskRepository.searchTasks("", null, "Work");
            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("combines search and status filter")
        void combinesFilters() {
            List<Task> result = taskRepository.searchTasks("tests", TaskStatus.IN_PROGRESS, null);
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("Write unit tests");
        }

        @Test
        @DisplayName("returns empty list when no match")
        void returnsEmptyOnNoMatch() {
            List<Task> result = taskRepository.searchTasks("nonexistent", null, null);
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findAllCategories")
    class FindAllCategoriesTests {

        @Test
        @DisplayName("returns distinct category names")
        void returnsDistinctCategories() {
            List<String> categories = taskRepository.findAllCategories();
            assertThat(categories).containsExactlyInAnyOrder("Personal", "Work");
        }

        @Test
        @DisplayName("does not include null categories")
        void excludesNullCategories() {
            taskRepository.save(Task.builder()
                    .title("No category task")
                    .status(TaskStatus.TODO)
                    .build());

            List<String> categories = taskRepository.findAllCategories();
            assertThat(categories).doesNotContainNull();
        }
    }

    @Nested
    @DisplayName("findByDueDateBefore")
    class FindByDueDateTests {

        @Test
        @DisplayName("finds tasks with due date before given date")
        void findsDueBeforeDate() {
            List<Task> result = taskRepository.findByDueDateBefore(LocalDateTime.of(2026, 3, 22, 0, 0));
            assertThat(result).hasSize(2); // inProgressTask and doneTask
        }
    }

    @Nested
    @DisplayName("sorting")
    class SortingTests {

        @Test
        @DisplayName("findAllByOrderByDueDateAsc returns tasks sorted by due date")
        void sortsByDueDate() {
            List<Task> sorted = taskRepository.findAllByOrderByDueDateAsc();
            assertThat(sorted.get(0).getTitle()).isEqualTo("Setup project");
            assertThat(sorted.get(1).getTitle()).isEqualTo("Write unit tests");
            assertThat(sorted.get(2).getTitle()).isEqualTo("Buy groceries");
        }

        @Test
        @DisplayName("findAllByOrderByStatusAsc returns tasks sorted by status")
        void sortsByStatus() {
            List<Task> sorted = taskRepository.findAllByOrderByStatusAsc();
            assertThat(sorted).hasSize(3);
        }
    }
}
