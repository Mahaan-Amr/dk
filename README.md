# Derakht-e-Kherad Blog Management System

## Overview

Derakht-e-Kherad is a multilingual blog management system built with Next.js and React. It provides an intuitive admin interface for creating, editing, and managing blog posts and categories in multiple languages (currently supporting Persian/Farsi and German).

## Features

### Blog Post Management
- Create, edit, and delete blog posts
- Multi-language content support
- Rich text editor for content creation
- Automatic slug generation from titles
- Draft/published/archived status management
- Featured image support
- Category assignment

### Category Management
- Create, edit, and delete categories
- Multi-language category names
- Automatic slug generation
- Hierarchical structure (parent/child relationships)
- Category reordering
- Visibility settings (public, registered users, admin-only)

### Media Management
- Upload and manage images
- Image optimization and resizing
- File type validation
- Media library for browsing and selecting images

### SEO Management
- Per-language SEO metadata
- Title and description management
- Keywords management
- Open Graph image support

### Multilingual Support
- Complete content management in multiple languages (German and Farsi)
- Language switching interface
- Independent content per language
- Modular translation system with separate files per component (nav, footer, blog, etc.)
- RTL support for Farsi

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: Custom React components
- **State Management**: React Hooks and Context
- **Styling**: CSS Modules / Custom styling + Tailwind CSS
- **Internationalization**: next-intl
- **Testing**: Jest, React Testing Library
- **API**: RESTful API endpoints

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   └── layout.tsx (locale-specific layout)
├── components/
│   ├── admin/
│   │   └── blog/
│   │       ├── BlogPostEditor.tsx
│   │       ├── BlogCategories.tsx
│   ├── locale-layout-client-wrapper.tsx
│   ├── navigation.tsx
│   └── localized-footer.tsx
├── messages/
│   ├── de/
│   │   ├── nav.json
│   │   ├── footer.json
│   │   └── ... (other translation files)
│   ├── fa/
│   │   ├── nav.json
│   │   ├── footer.json
│   │   └── ... (other translation files)
├── hooks/
│   └── useBlogEditorForm.ts
├── i18n.ts (translation loading)
└── ...
```

## Translation System

The project uses a modular translation system with the following components:

1. **Server-side Loading (`i18n.ts`)**: Loads translations for sections like 'nav', 'footer', etc.
2. **Client-side Loading (`locale-layout-client-wrapper.tsx`)**: Handles client-side translation loading
3. **Component Usage**:
   - `Navigation` component uses `useTranslations('nav')` to access navigation labels
   - `LocalizedFooter` component uses `useTranslations('footer')` for footer content
4. **Language Detection**:
   - Uses URL structure `/[locale]/...` to determine the current language
   - Supports fallback to default language when translations are missing

## Development Roadmap

### Phase 1: Core Blog Management ✅
- [x] Blog post editor component
- [x] Blog categories management
- [x] Multi-language support
- [x] Core hooks and utilities
- [x] Basic testing infrastructure

### Phase 2: Enhanced Features ✅
- [x] SEO metadata management
- [x] Advanced form validation
- [x] Comprehensive test coverage
- [x] Image upload and management
- [x] Modular translation system

### Phase 3: Advanced Features 🔄
- [ ] User authentication and permissions
- [ ] Editorial workflow (drafts, review, publish)
- [ ] User comments and moderation
- [ ] Tags and advanced categorization
- [ ] Content scheduling
- [ ] Analytics integration

### Phase 4: Performance and Optimization ⏳
- [ ] Server-side rendering optimization
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Performance monitoring
- [ ] SEO optimization

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd derakhtekherad
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing

The project includes both unit tests with Jest and end-to-end tests with Cypress.

### Running Tests

To run the unit tests:

```bash
npm run test           # Run all Jest tests
npm run test:watch     # Run Jest tests in watch mode
npm run test:coverage  # Run Jest tests with coverage
```

To run the end-to-end tests:

```bash
npm run test:e2e           # Run Cypress tests in interactive mode
npm run test:e2e:headless  # Run Cypress tests in headless mode
```

### Test Coverage

We have set up the infrastructure for code coverage reporting. The current implementation includes:

1. Jest tests with coverage reporting
2. Cypress tests with configuration for coverage reporting (partial implementation)
3. NYC configuration for coverage metrics

See the `COVERAGE.md` file for more details on the current status and future plans for code coverage improvements.

### Cypress Tests

The project includes end-to-end tests with Cypress for:

1. Admin authentication
2. Blog post management (listing, creation, editing)
3. Category management (listing, creation, editing, reordering)

These tests verify the core functionality of the application and ensure that the main user flows work correctly.

## Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
