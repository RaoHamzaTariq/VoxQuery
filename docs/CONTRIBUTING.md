# 🤝 Contributing to VoxQuery

> Guidelines and instructions for contributing to the VoxQuery project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- ✅ Be respectful and inclusive
- ✅ Accept constructive criticism
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

### Unacceptable Behavior

- ❌ Harassment or discrimination
- ❌ Trolling or insulting comments
- ❌ Publishing others' private information
- ❌ Promoting illegal activities

---

## Getting Started

### 1. Fork the Repository

```bash
# Visit the repository on GitHub
# Click the "Fork" button in the top-right corner
```

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/VoxQuery.git
cd VoxQuery
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API key
# NEXT_PUBLIC_GEMINI_API_KEY="your_key"
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### 5. Create a Branch

```bash
# Ensure you're on the main branch
git checkout main

# Pull latest changes
git pull origin main

# Create a new branch
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/voice-interrupt-improvement` |
| Bug Fix | `fix/description` | `fix/schema-loading-error` |
| Documentation | `docs/description` | `docs/add-api-examples` |
| Refactor | `refactor/description` | `refactor/state-management` |
| Test | `test/description` | `test/add-query-validation` |

---

## Development Workflow

### Making Changes

1. **Make your changes** following the [coding standards](#coding-standards)
2. **Test thoroughly** in both demo mode and with a real database
3. **Run linting** to ensure code quality
4. **Commit your changes** following [commit guidelines](#commit-guidelines)

### Testing Checklist

Before submitting your changes, ensure:

- [ ] Changes work in **Demo Mode**
- [ ] Changes work with **MySQL** (if applicable)
- [ ] Changes work with **PostgreSQL** (if applicable)
- [ ] **Voice features** work correctly
- [ ] **Charts** render properly
- [ ] **Mobile responsive** design is maintained
- [ ] **No console errors** in browser
- [ ] **TypeScript** type checking passes
- [ ] **ESLint** passes with no errors

### Run Tests and Linting

```bash
# Run TypeScript type checking
npx tsc --noEmit

# Run ESLint
npm run lint

# Run ESLint with auto-fix
npm run lint -- --fix

# Build production version
npm run build
```

---

## Coding Standards

### TypeScript

- ✅ Use TypeScript for all new code
- ✅ Define explicit types (avoid `any`)
- ✅ Use interfaces for object shapes
- ✅ Use type aliases for unions
- ✅ Enable strict mode

**Example:**
```typescript
// ✅ Good
interface DatabaseConnection {
  type: 'mysql' | 'postgres';
  host: string;
  port: number;
  database: string;
}

// ❌ Avoid
interface Connection {
  type: any;
  host: any;
}
```

### React Components

- ✅ Use functional components with hooks
- ✅ Use TypeScript for props and state
- ✅ Extract reusable logic to custom hooks
- ✅ Keep components small and focused
- ✅ Use meaningful component names

**Example:**
```typescript
// ✅ Good
interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  // Component logic
}

// ❌ Avoid
export default function Component(props) {
  // No types, unclear props
}
```

### Styling (Tailwind CSS)

- ✅ Use Tailwind utility classes
- ✅ Follow mobile-first approach
- ✅ Use semantic color names
- ✅ Maintain consistent spacing

**Example:**
```tsx
// ✅ Good
<div className="flex flex-col md:flex-row gap-4 p-6 bg-slate-900 text-slate-100">
  {/* Content */}
</div>

// ❌ Avoid
<div style={{ display: 'flex', padding: '24px', backgroundColor: '#0f172a' }}>
  {/* Content */}
</div>
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ChatInterface.tsx` |
| Hooks | camelCase with prefix | `use-live-gemini.ts` |
| Utilities | camelCase | `db-service.ts` |
| Config | camelCase | `tsconfig.json` |
| Styles | kebab-case | `globals.css` |

### Code Organization

```typescript
// ✅ Good: Organized imports
import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Component logic
export function MyComponent() {
  // 1. Hooks
  const { state } = useStore();
  const [local, setLocal] = useState(false);

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 3. Handlers
  const handleClick = () => {
    // Handler logic
  };

  // 4. Render
  return <div>Content</div>;
}
```

### Comments and Documentation

- ✅ Comment **why**, not **what**
- ✅ Document complex logic
- ✅ Add JSDoc for public functions
- ✅ Keep comments up-to-date

**Example:**
```typescript
// ✅ Good: Explains why
// Using 0.015 threshold based on testing with various microphones
// Lower values trigger on background noise, higher values miss quiet speech
const VOICE_ACTIVITY_THRESHOLD = 0.015;

// ❌ Avoid: States the obvious
// Set the threshold to 0.015
const THRESHOLD = 0.015;
```

---

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(voice): add auto-interrupt on voice detection"

# Bug fix
git commit -m "fix(schema): resolve PostgreSQL foreign key loading issue"

# Documentation
git commit -m "docs: update API documentation with examples"

# Refactor
git commit -m "refactor(store): simplify state management logic"
```

### Commit Best Practices

- ✅ Keep commits atomic (one logical change)
- ✅ Write clear, concise messages
- ✅ Use present tense ("add" not "added")
- ✅ Reference issues when applicable

**Example:**
```bash
# ✅ Good
git commit -m "feat(chart): add area chart visualization type

- Implement AreaChart component
- Add area chart to chart selector
- Update chart type detection logic

Closes #123"

# ❌ Avoid
git commit -m "fixed stuff"
```

---

## Pull Request Process

### Before Submitting

1. **Update Documentation**
   - Update README.md if adding features
   - Add comments for complex logic
   - Update API docs if changing endpoints

2. **Test Your Changes**
   - Run all tests locally
   - Test on different browsers
   - Test responsive design

3. **Review Your Code**
   - Check for console errors
   - Remove debug statements
   - Ensure consistent formatting

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature
   ```

2. **Open Pull Request on GitHub**
   - Navigate to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested with Demo Mode
   - [ ] Tested with MySQL
   - [ ] Tested with PostgreSQL
   - [ ] Tested on mobile

   ## Screenshots (if applicable)
   Add screenshots of UI changes

   ## Related Issues
   Closes #123
   ```

### PR Review Process

1. **Automated Checks**
   - TypeScript compilation
   - ESLint validation
   - Build success

2. **Code Review**
   - Maintainer reviews code
   - Requests changes if needed
   - Approves when ready

3. **Merge**
   - Squash and merge for feature branches
   - Rebase and merge for simple fixes

---

## Issue Reporting

### Before Creating an Issue

- ✅ Search existing issues (open and closed)
- ✅ Check the troubleshooting guide
- ✅ Test with latest main branch
- ✅ Gather reproduction steps

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## To Reproduce
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g., Windows 11, macOS Sonoma]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node.js: [e.g., 20.10.0]
- Database: [e.g., MySQL 8.0, PostgreSQL 15]

## Additional Context
Any other relevant information
```

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `question` | Further information needed |

---

## Feature Requests

### Before Submitting

- ✅ Search existing feature requests
- ✅ Ensure feature aligns with project goals
- ✅ Consider implementation complexity

### Feature Request Template

```markdown
## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
Other solutions you've thought about

## Additional Context
Mockups, examples, references

## Use Cases
Who will use this feature and how?
```

---

## Development Resources

### Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Configuration Guide](./CONFIGURATION.md)

### Tools

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)

### Getting Help

- 💬 **GitHub Discussions** - Ask questions
- 🐛 **GitHub Issues** - Report bugs
- 📧 **Email** - Contact maintainers

---

## Recognition

Contributors will be recognized in:

- 📜 README.md contributors section
- 🏆 Release notes
- ⭐ Project documentation

---

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

*Last Updated: March 3, 2026*
