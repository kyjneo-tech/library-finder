# Project Architecture

This project follows [Feature-Sliced Design (FSD)](https://feature-sliced.design/) principles to ensure maintainability and scalability.

## Directory Structure

### `app/` (App Layer)

- Contains Next.js App Router setup.
- **Rules**:
  - Keep logic minimal here.
  - Pages should compose features and widgets.
  - Global styles and providers live here.

### `entities/` (Business Entities)

- High-level business concepts (e.g., `book`, `library`).
- **Contains**: Model definitions, types, ui components specific to the entity.
- **Rules**: Cannot import from other entities or features.

### `features/` (Features)

- User interactions that bring value (e.g., `book-search`, `recommendations`).
- **Rules**: Can import from entities and shared.

### `shared/` (Shared Kernel)

- Reusable logic and UI unrelated to specific business logic.
- **Contains**: UI kit (`shadcn/ui`), utils, hooks, api clients.
- **Rules**: Accessible by all layers.

## Development Guidelines

### Imports

- Use absolute paths: `@/shared`, `@/entities`, `@/features`.
- Avoid relative paths like `../../`.

### Strict Boundaries

- **Features** should not import from other **Features**.
- **Entities** should not import from other **Entities**.
- If cross-import is needed, consider moving logic to `widgets` (if aggregating) or `shared` (if generic).

## Testing

- **Unit Tests**: Co-located with the component/function (`*.test.ts`, `*.test.tsx`).
- **Integration Tests**: Test feature workflows.
