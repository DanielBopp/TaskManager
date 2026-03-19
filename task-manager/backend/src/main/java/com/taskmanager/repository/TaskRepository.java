package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByCategory(String category);

    List<Task> findByDueDateBefore(LocalDateTime date);

    List<Task> findByDueDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Task> searchTasks(@Param("search") String search,
                           @Param("status") TaskStatus status,
                           @Param("category") String category);

    List<Task> findAllByOrderByDueDateAsc();

    List<Task> findAllByOrderByStatusAsc();

    @Query("SELECT DISTINCT t.category FROM Task t WHERE t.category IS NOT NULL")
    List<String> findAllCategories();
}
