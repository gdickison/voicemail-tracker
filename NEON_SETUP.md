# Neon Database Setup for Voicemail Tracker

## 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project
4. Note your connection string from the dashboard

## 2. Environment Configuration

Create a `.env.local` file in your project root with your Neon database URL:

```env
DATABASE_URL="postgresql://your-username:your-password@your-hostname:5432/your-database"
```

Replace the connection string with your actual Neon database URL from the console.

## 3. Database Schema

The application will automatically create the required tables when it first runs:

- `users` - Stores user information
- `voicemails` - Stores voicemail messages

## 4. Features

- **User Management**: Each user gets a unique ID stored in localStorage
- **Voicemail Storage**: All voicemails are stored in PostgreSQL
- **Real-time Updates**: Voicemails are refreshed after each operation
- **Returned Status**: Mark voicemails as returned (they disappear from the list)

## 5. Security

- Each user can only access their own voicemails
- User IDs are validated before any database operation
- SQL injection is prevented using parameterized queries

## 6. Running the Application

```bash
npm run dev
```

The application will automatically:
1. Initialize the database tables
2. Create or retrieve the user ID
3. Load existing voicemails
4. Allow adding, deleting, and marking voicemails as returned 