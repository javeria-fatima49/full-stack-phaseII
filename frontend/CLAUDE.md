# Frontend Development Guide

This document provides frontend-specific instructions for the Todo App frontend interface.

## Project Overview

This is a Next.js 16+ frontend application using the App Router architecture. The application provides a modern, responsive, and accessible interface for managing todo tasks.

## Technology Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Component Library**: shadcn/ui
- **Animations**: framer-motion
- **Authentication**: Better Auth (JWT)
- **Data Fetching**: SWR
- **Validation**: Zod

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard (home page)
│   ├── globals.css         # Global styles
│   └── tasks/              # Task-related pages
├── components/             # Reusable components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and API client
│   ├── api.ts              # Centralized API client
│   ├── auth.ts             # Authentication configuration
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
└── tests/                  # Test files
```

## Development Guidelines

### Component Architecture

1. **Server Components by Default**: Use Server Components unless you need:
   - Client-side interactivity (onClick, onChange, etc.)
   - React hooks (useState, useEffect, etc.)
   - Browser APIs (localStorage, window, etc.)

2. **Client Components**: Mark with `'use client'` directive at the top of the file

3. **Component Organization**:
   - Atoms: Basic UI elements (buttons, inputs) → `components/ui/`
   - Molecules: Simple component groups → `components/`
   - Organisms: Complex UI sections → `components/`
   - Pages: Route-level components → `app/`

### API Integration

All API calls MUST go through the centralized API client in `lib/api.ts`:

```typescript
import { apiClient } from '@/lib/api';

// Authenticated request
const response = await apiClient.get('/tasks', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Rules**:
- Include JWT tokens in Authorization headers for all authenticated requests
- Handle all response states: loading, success, error, empty data
- Map UI components precisely to API contracts from specifications

### State Management

Every component must handle four states:

```typescript
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataDisplay data={data} />;
```

### Styling Guidelines

1. **Tailwind CSS**: Use utility classes for all styling
2. **Responsive Design**: Mobile-first approach with breakpoints:
   - `xs`: 320px
   - `sm`: 640px
   - `md`: 768px
   - `lg`: 1024px
   - `xl`: 1280px
   - `2xl`: 1536px

3. **shadcn/ui Components**: Use existing components from `components/ui/`
4. **Custom Styles**: Add to `app/globals.css` only when necessary

### Accessibility Requirements

- Use semantic HTML elements (`button`, `nav`, `main`, `article`)
- Include ARIA roles and labels for screen readers
- Ensure keyboard navigation works for all interactive elements
- Maintain WCAG 2.1 Level AA color contrast standards
- Add focus-visible styles for keyboard users

### Animation Guidelines

Use framer-motion for animations:

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {children}
</motion.div>
```

**Performance**: Ensure animations run at 60fps on modern devices

## Code Quality Standards

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Define proper types for all props, API responses, and state
- Avoid `any` type - use `unknown` if type is truly unknown
- Use type inference where possible

### Naming Conventions

- Components: PascalCase (`TaskCard.tsx`)
- Functions: camelCase (`fetchTasks`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types/Interfaces: PascalCase (`Task`, `ApiResponse`)

### File Organization

- One component per file
- Co-locate related files (component + styles + tests)
- Use index files for cleaner imports when appropriate

## Testing Strategy

### Component Tests (Jest + React Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

test('renders task title', () => {
  render(<TaskCard task={mockTask} />);
  expect(screen.getByText('Task Title')).toBeInTheDocument();
});
```

### E2E Tests (Playwright)

```typescript
test('user can create a task', async ({ page }) => {
  await page.goto('/tasks/create');
  await page.fill('input[name="title"]', 'New Task');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/tasks');
});
```

## Common Patterns

### Data Fetching with SWR

```typescript
import useSWR from 'swr';
import { taskApi } from '@/lib/api';

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR('/tasks', taskApi.list);

  return {
    tasks: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
```

### Form Validation with Zod

```typescript
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;
```

### Error Handling

```typescript
try {
  const response = await apiClient.post('/tasks', data);
  // Handle success
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
    router.push('/login');
  } else {
    // Show error message
    toast.error(error.message);
  }
}
```

## Performance Optimization

1. **Code Splitting**: Use dynamic imports for large components
2. **Image Optimization**: Use Next.js `<Image>` component
3. **Lazy Loading**: Load components only when needed
4. **Memoization**: Use `React.memo`, `useMemo`, `useCallback` appropriately
5. **Bundle Analysis**: Run `npm run build` to check bundle size

## Debugging

### Development Tools

- React DevTools: Inspect component tree and props
- Network Tab: Monitor API requests and responses
- Console: Check for errors and warnings
- Lighthouse: Audit performance and accessibility

### Common Issues

1. **Hydration Errors**: Ensure Server and Client Components render the same HTML
2. **CORS Errors**: Check API proxy configuration in `next.config.js`
3. **Authentication Issues**: Verify JWT token is included in requests
4. **Styling Issues**: Check Tailwind CSS configuration and class names

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No console errors or warnings
- [ ] All tests passing (`npm test`)
- [ ] Lighthouse score > 90 for performance and accessibility
- [ ] Responsive design tested on multiple screen sizes
- [ ] Keyboard navigation works throughout
- [ ] Error handling implemented for all API calls

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [framer-motion Documentation](https://www.framer.com/motion/)
- [SWR Documentation](https://swr.vercel.app)
- [Zod Documentation](https://zod.dev)

## Getting Help

- Check specification documents in `specs/001-todo-frontend/`
- Review architectural plan in `specs/001-todo-frontend/plan.md`
- Consult API contracts in `specs/001-todo-frontend/contracts/`
- Ask for clarification when requirements are ambiguous

## Important Reminders

- **Spec-Driven Development**: Implement only what is specified
- **No Unplanned Features**: Do not add features without explicit approval
- **API Contract Mapping**: Every component must map to API endpoints
- **Comprehensive State Handling**: Handle loading, success, error, and empty states
- **Authentication**: Include JWT tokens in all authenticated requests
- **Accessibility**: WCAG 2.1 Level AA compliance is mandatory
