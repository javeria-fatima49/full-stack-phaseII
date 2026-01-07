# Todo App Frontend

A modern, responsive, and accessible web frontend for the Todo application built with Next.js 16+, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: View task statistics and recent tasks at a glance
- **Task Management**: Create, read, update, and delete tasks with full CRUD operations
- **Filtering & Sorting**: Filter by status (all, active, completed) and sort by multiple fields
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices (320px - 2560px+)
- **Accessibility**: WCAG 2.1 Level AA compliant with keyboard navigation and screen reader support
- **Smooth Animations**: Professional interactions powered by framer-motion (60fps)
- **Error Handling**: Comprehensive error boundaries and retry mechanisms
- **Loading States**: Skeleton loaders and loading spinners for better UX
- **Form Validation**: Client-side validation with Zod schemas
- **API Retry Logic**: Automatic retry with exponential backoff for failed requests
- **SEO Optimized**: Comprehensive meta tags for search engines and social media

## Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Component Library**: shadcn/ui
- **Animations**: framer-motion
- **Authentication**: Better Auth
- **Data Fetching**: SWR
- **Validation**: Zod

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Backend API running on `http://localhost:8000` (or configured URL)

## Getting Started

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Development Server

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Dashboard (home page)
│   ├── globals.css         # Global styles and Tailwind
│   └── tasks/              # Task-related pages
│       ├── page.tsx        # Task list page
│       ├── create/         # Create task page
│       └── [id]/           # Task detail and edit pages
├── components/             # Reusable components
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── skeleton.tsx
│       └── toast.tsx
├── lib/                    # Utilities and clients
│   ├── api.ts              # Centralized API client
│   ├── auth.ts             # Authentication configuration
│   └── utils.ts            # Helper functions (cn, etc.)
├── types/                  # TypeScript type definitions
│   ├── task.ts             # Task entity types
│   └── api.ts              # API request/response types
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   └── useTasks.ts         # Task data fetching hook
├── public/                 # Static assets
└── tests/                  # Test files
    ├── components/         # Component tests
    ├── integration/        # Integration tests
    └── e2e/                # End-to-end tests
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Create optimized production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint to check code quality

# Testing
npm test             # Run unit tests with Jest
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests with Playwright
```

## Development Guidelines

### Component Architecture

- **Server Components**: Default for static content and data fetching
- **Client Components**: Use `'use client'` for interactivity and hooks
- **Atomic Design**: Organize components by complexity (atoms → molecules → organisms)

### API Integration

All API calls go through the centralized client in `lib/api.ts`:

```typescript
import { apiClient } from '@/lib/api';

const response = await apiClient.get('/tasks', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### State Management

Handle all four states in every component:

1. **Loading**: Show skeleton or spinner
2. **Success**: Display data
3. **Error**: Show error message with retry option
4. **Empty**: Display empty state with call-to-action

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Leverage shadcn/ui components for consistency
- Maintain WCAG 2.1 Level AA color contrast

### Accessibility

- Use semantic HTML elements
- Include ARIA roles and labels
- Ensure keyboard navigation works
- Test with screen readers

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
npm test
```

Test individual components in isolation:

```typescript
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

test('renders task title', () => {
  render(<TaskCard task={mockTask} />);
  expect(screen.getByText('Task Title')).toBeInTheDocument();
});
```

### End-to-End Tests (Playwright)

```bash
npm run test:e2e
```

Test complete user workflows:

```typescript
test('user can create a task', async ({ page }) => {
  await page.goto('/tasks/create');
  await page.fill('input[name="title"]', 'New Task');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/tasks');
});
```

## Docker Support

### Build Docker Image

```bash
docker build -t todo-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000/api \
  -e BETTER_AUTH_SECRET=your-secret \
  todo-frontend
```

### Docker Compose

See `docker-compose.yml` in the repository root for full stack deployment.

## Performance Optimization

- **Code Splitting**: Automatic with Next.js App Router (each page loads only required JavaScript)
- **Image Optimization**: Use Next.js `<Image>` component (automatic WebP/AVIF conversion)
- **Lazy Loading**: Dynamic imports for large components
- **Caching**: SWR handles data caching automatically with revalidation
- **Font Optimization**: Next.js font optimization with Inter font subset
- **Tree Shaking**: Removes unused code from bundles
- **Minification**: SWC minification enabled for production builds
- **API Retry Logic**: Exponential backoff prevents unnecessary requests

### Performance Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

Run Lighthouse audit to verify performance:

```bash
lighthouse http://localhost:3000 --view
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Troubleshooting

### Common Issues

**Issue**: Hydration errors
**Solution**: Ensure Server and Client Components render the same HTML. Check for browser-only APIs in Server Components.

**Issue**: CORS errors
**Solution**: Check API proxy configuration in `next.config.js`. Verify `NEXT_PUBLIC_API_URL` is set correctly.

**Issue**: Authentication failures (401)
**Solution**: Verify JWT token is included in Authorization header. Check token expiration. Application automatically redirects to login on 401.

**Issue**: Styling not applied
**Solution**: Check Tailwind CSS configuration and class names. Ensure `globals.css` is imported in layout.

**Issue**: API requests failing
**Solution**: Verify backend is running on configured URL. Check network tab for errors. API client automatically retries failed requests 3 times with exponential backoff.

**Issue**: Build errors
**Solution**: Clear `.next` directory and rebuild: `rm -rf .next && npm run build`

**Issue**: TypeScript errors
**Solution**: Run `npm run lint` to check for type errors. Ensure all dependencies are installed.

### Debug Mode

Enable verbose logging:

```bash
DEBUG=* npm run dev
```

Check browser console for errors and warnings. Use React DevTools to inspect component tree.

## Contributing

1. Follow the coding standards in `CLAUDE.md`
2. Write tests for new features
3. Ensure all tests pass before submitting
4. Maintain accessibility standards
5. Update documentation as needed

## Documentation

### Core Documentation
- **Specification**: `specs/001-todo-frontend/spec.md`
- **Architecture Plan**: `specs/001-todo-frontend/plan.md`
- **API Contracts**: `specs/001-todo-frontend/contracts/`
- **Development Guide**: `CLAUDE.md`

### Additional Guides
- **Accessibility Audit**: `docs/ACCESSIBILITY_AUDIT.md` - WCAG 2.1 compliance checklist
- **Testing Guide**: `docs/TESTING_GUIDE.md` - Cross-browser and responsive testing
- **Asset Optimization**: `docs/ASSET_OPTIMIZATION.md` - Image and asset optimization
- **Favicon Setup**: `docs/FAVICON_SETUP.md` - Icon and favicon configuration

## License

This project is part of the Todo App Phase II implementation.

## Support

For issues or questions:
1. Check the specification documents in `specs/001-todo-frontend/`
2. Review the architectural plan
3. Consult API contracts
4. Ask for clarification when requirements are unclear
