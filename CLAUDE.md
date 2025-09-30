# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WhatsApp Bulk Messenger application built with Next.js 14 that sends mass WhatsApp messages through the Gowa API. The app features spintax support, message personalization, CSV imports, and advanced sending controls with anti-ban protection.

## Development Commands

```bash
# Development
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint (currently disabled during builds)

# Package management
pnpm install      # Install dependencies
```

## Architecture Overview

### Application Structure
- **Next.js App Router**: Uses the new app directory structure with React Server Components
- **Component-based Architecture**: Feature-specific components with shadcn/ui design system
- **TypeScript**: Strict typing throughout with custom interfaces for API integration
- **Client-side State Management**: Local state with useState, no global state management

### Key Architectural Patterns

**Wizard-style Interface**: The main app follows a 4-step wizard pattern:
1. Recipients (CSV upload or manual input)
2. Message composition with spintax
3. API configuration
4. Bulk sending with real-time progress

**API Proxy Pattern**: The app uses a Next.js API route (`app/api/gowa/send/message/route.ts`) as a proxy to the external Gowa API at `http://<IP_ADDRESS>/send/message` to handle CORS issues.

**Business Logic Separation**: Core functionality is separated into `lib/` modules:
- `gowa-api.ts`: API communication, phone formatting, validation
- `spintax.ts`: Message template processing with `{option1|option2}` syntax and `[[variable]]` substitution

### Component Architecture

**Feature Components** (in `components/`):
- `bulk-sender.tsx`: Main sending interface with progress tracking, pause/resume functionality
- `message-composer.tsx`: Message editor with spintax syntax highlighting
- `csv-upload.tsx`: File upload with CSV parsing and validation
- `api-config.tsx`: API credentials configuration with connection testing
- `spintax-preview.tsx`: Real-time preview of message variations

**UI Components**: Located in `components/ui/` - shadcn/ui components based on Radix UI primitives

### Data Flow
1. User configures recipients (CSV with nama/nomor columns OR manual phone numbers)
2. Composes message template with spintax `{hello|hi|hey}` and variables `[[nama]]`
3. Configures Gowa API credentials (endpoint, username, password)
4. Bulk sender processes each recipient:
   - Applies spintax randomization
   - Substitutes variables (nama from CSV)
   - Formats phone numbers with `@s.whatsapp.net` suffix
   - Sends via proxy API with configurable delays (5-15 seconds)

### State Management Patterns
- **Component-level state**: Each feature component manages its own state
- **Prop passing**: State flows down through props in the main page component
- **Callback pattern**: Child components communicate back via callback props
- **No global state**: Application uses local state management only

### TypeScript Integration
- **Strict configuration**: TypeScript errors ignored during build for development focus
- **Interface-driven**: Strong typing for API responses, component props, and business logic
- **Path aliases**: Uses `@/` prefix for internal imports

## Key Configuration Files

- `next.config.mjs`: Disables ESLint/TypeScript errors during build, unoptimized images
- `tsconfig.json`: Strict TypeScript with path aliases (`@/*` maps to `./`)
- `components.json`: shadcn/ui configuration
- `package.json`: Uses pnpm as package manager

## External API Integration

The app integrates with the Gowa WhatsApp Web API:
- **Proxy Endpoint**: `/api/gowa/send/message` proxies to `http://<IP_ADDRESS>/send/message`
- **Authentication**: Basic Auth with username/password
- **Message Format**: Phone numbers formatted as `{number}@s.whatsapp.net`
- **Response Handling**: Processes various response codes (SUCCESS, 400, 500, etc.)

## Development Notes

- **Package Manager**: Project uses pnpm exclusively
- **Build Configuration**: ESLint and TypeScript errors are ignored during builds
- **CORS Handling**: API proxy handles CORS for external Gowa API
- **Anti-ban Features**: Configurable delays between messages (5-15 seconds recommended)