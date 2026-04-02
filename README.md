Project Demo: [Screencast from 02-18-2026 04:22:12 PM.webm](https://github.com/user-attachments/assets/244dc49f-3e9e-4f40-ac69-565cfd9b67dd)

# WebSocket Chat App

An AI-powered real-time chat application built with Next.js, featuring Google authentication, Supabase database integration, and live streaming responses from Google's Gemini AI.

## Features

- **Real-time Chat**: Instant messaging with live updates using Supabase Realtime WebSockets
- **AI Integration**: Powered by Google's Gemini 2.5-flash model for intelligent responses
- **Authentication**: Secure Google OAuth login via Supabase Auth
- **Responsive Design**: Modern UI built with Tailwind CSS and Lucide React icons
- **Message Management**: Send, edit, delete messages with persistent storage
- **Live Streaming**: Real-time streaming of AI responses for a conversational experience
- **Type-Safe**: Full TypeScript implementation for reliability and developer experience

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, PostCSS
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime WebSockets
- **AI**: Google Gemini AI via AI SDK
- **Icons**: Lucide React
- **Notifications**: Sonner for toast notifications
- **Linting**: ESLint

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project
- Google Cloud Console account for Gemini API
- Google OAuth credentials

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd websocket-app/wschatapp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

## Environment Setup

Create a `.env.local` file in the `wschatapp` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setting up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Authentication > Providers and enable Google OAuth
3. Configure your Google OAuth credentials from Google Cloud Console
4. Create a `messages` table in your database with the following schema:
   ```sql
   CREATE TABLE messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS (Row Level Security)
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

   -- Create policy for users to access their own messages
   CREATE POLICY "Users can access their own messages" ON messages
     FOR ALL USING (auth.uid() = user_id);
   ```

### Setting up Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an API key for Gemini
3. Add the key to your environment variables

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Sign in with Google

4. Start chatting with the AI assistant!

## API Endpoints

### Authentication
- `GET /auth/callback` - OAuth callback handler

### Chat
- `POST /api/chat` - Send a message and get AI response

## Project Structure

```
wschatapp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Protected dashboard routes
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   └── chat/                     # Chat components
├── controllers/                  # Business logic controllers
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
│   ├── config/                   # Configuration files
│   └── supabase/                 # Supabase client setup
├── repositories/                 # Data access layer
├── services/                     # External service integrations
│   ├── ai/                       # AI service (Gemini)
│   ├── database/                 # Database services
│   └── realtime/                 # Real-time services
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Demo

[Screencast from 02-18-2026 04:22:12 PM.webm](https://github.com/user-attachments/assets/881dcbc5-d8ca-4d07-b3dc-82b3a79e44fb)
