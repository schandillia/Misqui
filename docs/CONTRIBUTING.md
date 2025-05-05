# Contributing Guide

## Code Style and Naming Conventions

### File Naming

1. **React Components**

   - Use PascalCase for component files
   - Example: `UserProgress.tsx`, `ChallengeCard.tsx`

2. **Database Files**

   - Use kebab-case for schema files
   - Example: `user-progress.ts`, `challenge-options.ts`

3. **Utility Files**

   - Use camelCase for utility functions
   - Example: `formatDate.ts`, `validateInput.ts`

4. **API Routes**
   - Use kebab-case for route files
   - Example: `user-progress.ts`, `course-progress.ts`

### Code Naming

1. **Variables and Functions**

   - Use camelCase for variables and functions
   - Use descriptive, intention-revealing names
   - Example:
     ```typescript
     const userProgress = await getUserProgress();
     const calculateTotalPoints = () => { ... };
     ```

2. **Constants**

   - Use UPPER_SNAKE_CASE for constants
   - Example:
     ```typescript
     const MAX_RETRY_ATTEMPTS = 3
     const DEFAULT_PAGE_SIZE = 10
     ```

3. **Types and Interfaces**

   - Use PascalCase for types and interfaces
   - Prefix interfaces with 'I' (optional)
   - Example:
     ```typescript
     interface IUserProgress { ... }
     type ChallengeType = 'SELECT' | 'ASSIST';
     ```

4. **Database Tables**

   - Use snake_case for table names
   - Use singular form for table names
   - Example: `user_progress`, `challenge_options`

5. **Database Columns**
   - Use snake_case for column names
   - Use descriptive names
   - Example: `created_at`, `is_completed`

### Component Structure

1. **Component Organization**

   ```typescript
   // Imports
   import { ... } from '...';

   // Types
   interface Props { ... }

   // Component
   export const ComponentName = ({ prop1, prop2 }: Props) => {
     // Hooks
     const [state, setState] = useState();

     // Handlers
     const handleClick = () => { ... };

     // Render
     return ( ... );
   };
   ```

2. **File Structure**
   ```
   component/
   ├── index.ts
   ├── ComponentName.tsx
   ├── ComponentName.test.tsx
   └── styles.module.css
   ```

### Database Queries

1. **Query Function Naming**

   - Use verbs to indicate action
   - Example:
     ```typescript
     const getUserProgress = async () => { ... };
     const updateChallengeStatus = async () => { ... };
     ```

2. **Query Organization**

   ```typescript
   // Imports
   import { ... } from '...';

   // Types
   interface QueryResult { ... }

   // Query function
   export const queryName = async (): Promise<QueryResult> => {
     // Implementation
   };
   ```

### CSS/Styling

1. **CSS Modules**

   - Use camelCase for class names
   - Example: `container`, `headerTitle`

2. **Tailwind Classes**
   - Group related classes
   - Use consistent ordering
   - Example:
     ```tsx
     <div className="
       flex items-center justify-between
       p-4 rounded-lg
       bg-white dark:bg-gray-800
       shadow-sm
     ">
     ```

### Git Commit Messages

1. **Format**

   ```
   type(scope): subject

   body

   footer
   ```

2. **Types**

   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes
   - `refactor`: Code refactoring
   - `test`: Adding tests
   - `chore`: Maintenance tasks

3. **Example**

   ```
   feat(auth): add multi-factor authentication

   - Implement 2FA using AuthJS
   - Add QR code generation
   - Add backup codes support

   Closes #123
   ```

### Pull Request Process

1. **Branch Naming**

   - Feature: `feature/description`
   - Bug fix: `fix/description`
   - Documentation: `docs/description`

2. **PR Description**
   - Clear title
   - Detailed description
   - Related issues
   - Testing instructions
   - Screenshots (if applicable)

### Testing

1. **Test File Naming**

   - Match component name
   - Add `.test` or `.spec` suffix
   - Example: `UserProgress.test.tsx`

2. **Test Structure**
   ```typescript
   describe("ComponentName", () => {
     it("should do something", () => {
       // Test implementation
     })
   })
   ```

## Getting Started

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## Code Review Process

1. All PRs require at least one review
2. All tests must pass
3. Code must follow style guide
4. Documentation must be updated

## Questions?

Feel free to open an issue or contact the maintainers at [amit@schandillia.com](mailto:amit@schandillia.com).
