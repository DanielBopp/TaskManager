# Task Manager

A full-stack web application for managing tasks, built with **React + TypeScript** (frontend) and **Spring Boot** (backend). Supports complete CRUD operations, search/filter, sorting, categories, and real-time status updates.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Architecture Decisions](#architecture-decisions)

---

## Features

**Core (CRUD)**
- Create, read, update, and delete tasks
- Task fields: title (required, max 100), description (optional, max 500), status (TODO / IN_PROGRESS / DONE), due date, category

**Search & Filter**
- Full-text search on task titles (case-insensitive)
- Filter by status and/or category
- Sort by title, due date, or status (ascending/descending)

**UX**
- Inline status change via dropdown (no modal needed)
- Due-date indicators: "Soon" (≤3 days) and "Overdue" (past due, non-DONE)
- Confirmation dialog before deletion
- Form validation with character counters and error messages
- API error display with banner alerts
- Keyboard-accessible modals (Escape closes)

**Bonus**
- Category support (group tasks, filter by category, autocomplete suggestions)
- H2 console available at `http://localhost:8080/h2-console` for development

---

## Tech Stack

| Layer     | Technology                           |
|-----------|--------------------------------------|
| Frontend  | React 18, TypeScript, Vite, TailwindCSS |
| Backend   | Spring Boot 3.2, Java 17             |
| Database  | H2 (in-memory)                       |
| Build     | Maven (backend), npm (frontend)      |
| Testing   | JUnit 5, Mockito, MockMvc (backend); Vitest, Testing Library (frontend) |

---

## Project Structure

```
task-manager/
├── backend/                          # Spring Boot application
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/taskmanager/
│       │   ├── TaskManagerApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── controller/TaskController.java
│       │   ├── dto/TaskRequest.java
│       │   ├── dto/TaskResponse.java
│       │   ├── exception/
│       │   │   ├── ErrorResponse.java
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   └── TaskNotFoundException.java
│       │   ├── model/Task.java
│       │   ├── model/TaskStatus.java
│       │   ├── repository/TaskRepository.java
│       │   └── service/TaskService.java
│       ├── main/resources/application.properties
│       └── test/java/com/taskmanager/
│           ├── TaskManagerApplicationTest.java
│           ├── controller/TaskControllerTest.java
│           ├── integration/TaskIntegrationTest.java
│           ├── repository/TaskRepositoryTest.java
│           └── service/TaskServiceTest.java
│
└── frontend/                         # React application
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/taskApi.ts
        ├── components/
        │   ├── ConfirmDialog.tsx
        │   ├── Modal.tsx
        │   ├── TaskCard.tsx
        │   ├── TaskFiltersBar.tsx
        │   └── TaskForm.tsx
        ├── hooks/useTasks.ts
        ├── types/task.ts
        ├── utils/taskUtils.ts
        ├── App.tsx
        └── test/
            ├── setup.ts
            ├── ConfirmDialog.test.tsx
            ├── Modal.test.tsx
            ├── TaskCard.test.tsx
            ├── TaskFiltersBar.test.tsx
            ├── TaskForm.test.tsx
            ├── taskApi.test.ts
            └── taskUtils.test.ts
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm

### Backend Setup

```bash
cd task-manager/backend

# Run the application
mvn spring-boot:run

# Or build and run the JAR
mvn clean package -DskipTests
java -jar target/task-manager-backend-1.0.0.jar
```

The API will be available at `http://localhost:8080`.
H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:taskdb`, no password).

### Frontend Setup

```bash
cd task-manager/frontend

# Install dependencies
npm install

# Start development server (proxies /api to localhost:8080)
npm run dev
```

The app will be available at `http://localhost:5173`.

> **Important:** Start the backend first, then the frontend.

---

## API Reference

Base URL: `http://localhost:8080/api`

### Endpoints

| Method | Path                     | Description              | Body / Params            |
|--------|--------------------------|--------------------------|--------------------------|
| GET    | `/tasks`                 | Get all tasks            | `?search=&status=&category=` |
| GET    | `/tasks/{id}`            | Get task by ID           | —                        |
| POST   | `/tasks`                 | Create a new task        | `TaskRequest` JSON       |
| PUT    | `/tasks/{id}`            | Update a task            | `TaskRequest` JSON       |
| DELETE | `/tasks/{id}`            | Delete a task            | —                        |
| GET    | `/tasks/categories`      | Get all categories       | —                        |

### Task Entity

```json
{
  "id": 1,
  "title": "My Task",
  "description": "Optional description",
  "status": "TODO",
  "dueDate": "2026-04-01",
  "category": "Work"
}
```

**Status values:** `TODO` | `IN_PROGRESS` | `DONE`

### TaskRequest (POST / PUT body)

```json
{
  "title": "My Task",        // required, max 100 chars
  "description": "...",      // optional, max 500 chars
  "status": "TODO",          // required
  "dueDate": "2026-04-01",   // optional (ISO date)
  "category": "Work"         // optional, max 100 chars
}
```

### Error Response

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2026-03-19T10:00:00",
  "errors": ["title: Title is required"]
}
```

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
mvn test

# Run with coverage report
mvn test jacoco:report
```

Test categories:
- **Unit tests** (`TaskServiceTest`): 20+ tests with Mockito mocking
- **Controller tests** (`TaskControllerTest`): 18+ tests with MockMvc + `@WebMvcTest`
- **Repository tests** (`TaskRepositoryTest`): 20+ tests with `@DataJpaTest` + H2
- **Integration tests** (`TaskIntegrationTest`): 6 full end-to-end API tests with `@SpringBootTest`

### Frontend Tests

```bash
cd frontend

# Install dependencies first
npm install

# Run all tests
npm run test:run

# Watch mode
npm test

# With coverage report
npm run test:coverage
```

Test categories:
- `taskUtils.test.ts`: 22 tests covering utility functions
- `TaskCard.test.tsx`: 13 tests for task card rendering and interactions
- `TaskForm.test.tsx`: 16 tests for form validation and submission
- `Modal.test.tsx`: 8 tests for modal accessibility and behavior
- `ConfirmDialog.test.tsx`: 6 tests for confirm dialog
- `TaskFiltersBar.test.tsx`: 13 tests for filter/sort bar
- `taskApi.test.ts`: API module structure tests

**Total:** ~100+ test cases across both frontend and backend (well above the 85% target).

---

## Architecture Decisions

### Backend

- **DTO pattern**: `TaskRequest` / `TaskResponse` separate API contract from the JPA entity, preventing over-posting and enabling independent evolution.
- **Global exception handler**: `@RestControllerAdvice` centralizes error formatting so every endpoint returns a consistent `ErrorResponse` JSON.
- **Bean Validation**: `@NotBlank`, `@Size`, `@NotNull` on `TaskRequest` keep validation rules close to the data contract.
- **H2 in-memory database**: Zero-config persistence for development. Switch to PostgreSQL by changing `application.properties`.
- **CORS configuration**: `CorsConfig` explicitly allows the Vite dev server origins while the production build is served from the same origin.
- **Repository query methods**: Mix of Spring Data derived queries and `@Query` JPQL for the flexible search endpoint.

### Frontend

- **Custom hook `useTasks`**: Encapsulates all API calls and state management, keeping components purely presentational.
- **Optimistic UI pattern**: After mutations (create/update/delete), `fetchTasks()` is called to re-sync with the server rather than manipulating local state directly — simpler and always consistent.
- **Vite proxy**: `/api` requests are proxied to the backend during development, avoiding CORS issues without changing the API base URL.
- **TailwindCSS**: Utility-first styling keeps components self-contained with no external CSS files.
- **Vitest + Testing Library**: Tests use `@testing-library/react` semantics (query by role, label, text) over implementation details.
