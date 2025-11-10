# Kanny Kanban Frontend

A modern, full-featured Kanban board application built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Drag & Drop**: dnd-kit
- **State Management**: React Context API
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## Features

- 🔐 User authentication (Signup, Login, Logout)
- 📋 Multiple Kanban boards per user
- 📝 Columns and cards with drag & drop
- 🎨 Modern, responsive UI
- ⚡ Optimistic updates for smooth UX
- 🔒 Protected routes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kanny-kanban-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── login/       # Login page
│   ├── signup/      # Signup page
│   └── boards/      # Board pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── Board/       # Board-specific components
├── context/         # React Context providers
│   ├── AuthContext.tsx
│   └── BoardContext.tsx
├── lib/             # Utilities and API client
│   ├── api.ts       # API client
│   └── utils.ts     # Helper functions
└── tests/           # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Testing

Run tests with:
```bash
npm test
```

## API Integration

The frontend communicates with the backend API. Make sure the backend is running and the `NEXT_PUBLIC_API_URL` environment variable is set correctly.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
4. Deploy!

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:3001/api`)

## License

MIT

