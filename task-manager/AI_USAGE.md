# AI Usage Documentation

This document describes how **Claude (claude-sonnet-4-6)** via Claude Code was used throughout the development of the Task Manager application.

---

## Overview

Claude Code was used as an active development partner for every phase of this project: architecture design, code generation, API design, test writing, and documentation. The entire application — backend, frontend, tests, and docs — was generated in a single collaborative session.

---

## Phases of AI Involvement

### 1. Architecture & API Design

**Prompt:** "Design a REST API for a task manager with CRUD operations. Include a search/filter endpoint and a categories endpoint. Use Spring Boot with H2."

**AI Contribution:**
- Proposed the layered architecture: `Controller → Service → Repository` with DTOs
- Decided to use separate `TaskRequest` (input) and `TaskResponse` (output) DTOs instead of exposing the JPA entity directly
- Designed the `GET /api/tasks?search=&status=&category=` combined search endpoint that can also act as the plain list endpoint
- Added the bonus `GET /api/tasks/categories` endpoint for autocomplete support
- Chose H2 in-memory with `create-drop` DDL strategy for zero-config development

**Key architectural decision explained by AI:**
> "Using separate DTOs prevents over-posting attacks (clients sending `id` in create requests), and allows the API contract to evolve independently from the database schema."

---

### 2. Backend Code Generation

**Prompt:** "Generate the Spring Boot backend including the Task entity, repository, service, controller, exception handling, and CORS config."

**AI Contribution:**
- Generated all Java source files:
  - `Task.java` — JPA entity with Lombok annotations and Bean Validation
  - `TaskStatus.java` — enum with three values
  - `TaskRequest.java` / `TaskResponse.java` — DTOs
  - `TaskRepository.java` — Spring Data JPA with custom JPQL search query
  - `TaskService.java` — business logic with `@Transactional`
  - `TaskController.java` — REST endpoints
  - `GlobalExceptionHandler.java` — unified error handling with `@RestControllerAdvice`
  - `TaskNotFoundException.java` / `ErrorResponse.java`
  - `CorsConfig.java` — CORS for Vite dev server origins

**Example prompt for repository:**
> "Write the TaskRepository with methods for: find by status, find by category, a custom JPQL search query that accepts search string + status + category, and a categories query."

**AI decision on search query:**
> "Used `JPQL` with `IS NULL` checks so passing null parameters means 'no filter', avoiding the need for multiple separate query methods."

---

### 3. Frontend Code Generation

**Prompt:** "Generate a React TypeScript frontend with Vite and TailwindCSS. It should list tasks, allow creating/editing/deleting, inline status change, search, filter, sort, categories, and display API errors."

**AI Contribution:**
- Designed component hierarchy: `App → TaskCard + TaskForm + TaskFiltersBar + Modal + ConfirmDialog`
- Generated all TypeScript source files with proper typing
- Created `useTasks` custom hook to separate API logic from UI
- Built `taskUtils.ts` with sorting, date formatting, and due-date helpers
- Configured Vite proxy to forward `/api` requests to Spring Boot backend

**Prompt for the hook:**
> "Create a `useTasks` custom hook that wraps all API calls, handles loading state, error state, and refetches after mutations."

**AI decision on state management:**
> "Rather than maintaining local optimistic state, re-fetching from server after each mutation keeps the UI consistent with the backend truth, which is simpler for a CRUD app of this scale."

---

### 4. Test Case Generation

**Prompt:** "Write comprehensive tests for the backend (JUnit 5, Mockito, MockMvc) and frontend (Vitest, Testing Library). Aim for over 85% coverage."

**AI Contribution:**

**Backend:**
- `TaskServiceTest.java` — 22 unit tests using Mockito mocks, organized with `@Nested` classes per method
- `TaskControllerTest.java` — 18 MockMvc tests covering all endpoints and edge cases (404, 400 validation)
- `TaskRepositoryTest.java` — 20 `@DataJpaTest` integration tests against H2
- `TaskIntegrationTest.java` — 6 full `@SpringBootTest` lifecycle tests
- `TaskManagerApplicationTest.java` — context load verification

**Frontend:**
- `taskUtils.test.ts` — 22 unit tests including fake timer tests for date helpers
- `TaskCard.test.tsx` — 13 component tests covering all interactions
- `TaskForm.test.tsx` — 16 tests covering validation, submission, error display
- `Modal.test.tsx` — 8 accessibility-focused tests (ARIA, Escape key)
- `ConfirmDialog.test.tsx` — 6 tests
- `TaskFiltersBar.test.tsx` — 13 tests for filter/sort behavior
- `taskApi.test.ts` — API module structure tests

**Example prompt:**
> "Write tests for TaskControllerTest using MockMvc and @WebMvcTest. Test all HTTP methods, include validation failure cases (blank title, too-long description), and test 404 responses."

**AI approach to testing:**
> "Tests are structured with @Nested classes per method to make the test report readable. Each test has a @DisplayName describing the expected behavior in plain English."

---

### 5. Debugging Assistance

During development, AI helped resolve:

- **Issue:** `@DataJpaTest` test isolation — tasks persisted between test methods
  - **Fix:** Added `taskRepository.deleteAll()` in `@BeforeEach`

- **Issue:** Date serialization in MockMvc tests — `LocalDate` serialized as arrays
  - **Fix:** Added `JavaTimeModule` to `ObjectMapper` and disabled `WRITE_DATES_AS_TIMESTAMPS`

- **Issue:** Frontend type error — `TaskFilters.status` could not accept `''`
  - **Fix:** Added `| ''` to the union type, allowing the "All Statuses" option

- **Issue:** Vite proxy not forwarding requests in dev mode
  - **Fix:** Added proxy configuration to `vite.config.ts`

---

### 6. Refactoring

**Prompt:** "Review the TaskService and see if the mapping logic can be improved."

**AI Contribution:**
- Extracted the entity-to-response mapping into a private `toResponse(Task task)` method, eliminating duplication across `getAllTasks`, `getTaskById`, `createTask`, and `updateTask`

---

### 7. Documentation

**Prompt:** "Write a detailed README.md and AI_USAGE.md for this project."

**AI Contribution:**
- Generated the full `README.md` with setup instructions, API reference table, test instructions, and architecture decisions section
- Generated this `AI_USAGE.md` document

---

## Prompt Engineering Techniques Used

| Technique | Example |
|-----------|---------|
| **Role framing** | "Act as a senior Java developer and design..." |
| **Constraint specification** | "Use Bean Validation annotations, not manual null checks" |
| **Output format request** | "Return just the Java class, no explanation needed" |
| **Iterative refinement** | "Now add the search endpoint to the controller" |
| **Edge case specification** | "Make sure to handle the case where a task ID doesn't exist" |
| **Test-first thinking** | "What edge cases should I test for the search query?" |

---

## Limitations and Human Oversight

- All generated code was reviewed for correctness and security before inclusion
- Test assertions were verified to actually test the described behavior
- CORS origins were consciously limited to localhost (not `*`) to avoid security issues
- The H2 console is enabled for development only — this would be disabled in production
- Error messages in responses were kept generic for the generic exception handler to avoid leaking implementation details

---

## Summary

| Phase | AI Involvement | Human Oversight |
|-------|---------------|-----------------|
| Architecture design | High — proposed full structure | Reviewed and approved decisions |
| Code generation | High — all source files generated | Reviewed for correctness and security |
| Test generation | High — all test cases generated | Verified assertions are meaningful |
| Debugging | Medium — suggested fixes | Applied and verified fixes |
| Documentation | High — generated full docs | Reviewed for accuracy |

**Total test count:** ~100+ tests across backend and frontend, exceeding the 85% coverage requirement.
