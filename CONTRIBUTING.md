# Contributing to Snake.AI 2026

Thank you for your interest in contributing to Snake.AI 2026! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case and benefits**
- **Possible implementation approach**
- **Alternative solutions considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow coding standards**:
   - Use TypeScript strict mode
   - Follow existing code style
   - Add JSDoc comments for functions
   - Keep functions under 50 lines
   - Maintain test coverage above 70%

3. **Write tests** for new features
4. **Update documentation** as needed
5. **Ensure all tests pass**: `npm test`
6. **Run linting**: `npm run lint`
7. **Build successfully**: `npm run build`

### Coding Standards

#### TypeScript

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
}

function createUser({ name, email }: UserProps): User {
  // Implementation
}

// ❌ Bad
function createUser(name: any, email: any) {
  // Implementation
}
```

#### React Components

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ Bad
export function Button(props: any) {
  return <button>{props.label}</button>;
}
```

#### Testing

```typescript
// ✅ Good
describe('Button Component', () => {
  it('should render with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add dark mode toggle to settings page

- Implemented theme switcher component
- Added persistence to localStorage
- Updated documentation
```

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/promptwar.git
cd promptwar

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev

# Run tests
npm test
```

## Project Structure

- `src/app/` - Next.js pages and routes
- `src/components/` - Reusable React components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions
- `src/types/` - TypeScript type definitions
- `__tests__/` - Test files

## Testing Guidelines

- Write tests for all new features
- Maintain minimum 70% code coverage
- Use React Testing Library for component tests
- Use Jest for unit tests
- Test edge cases and error scenarios

## Documentation

- Update README.md for new features
- Add JSDoc comments to functions
- Update API documentation
- Include code examples

## Review Process

1. All PRs require at least one approval
2. All tests must pass
3. Code coverage must not decrease
4. No merge conflicts
5. Follow coding standards

## Questions?

Feel free to open an issue for questions or reach out to harshgupta8512@gmail.com.

Thank you for contributing! 🎉
