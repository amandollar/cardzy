# Cardzy 🎮

**Cardzy** is a modern, backend-heavy Memory Puzzle Game built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. It features real-time state management, a secure global leaderboard, custom image uploads, and a retro 8-bit aesthetic.

![Cardzy Gameplay](https://placehold.co/1200x600/1e293b/ffffff?text=Cardzy+Preview)

## ✨ Features

*   **🧠 Memory Challenge**: Classic tile-matching gameplay to train your brain.
*   **🏆 Global Leaderboard**: Compete with players worldwide for Best Time and Best Moves.
*   **🔒 Secure Auth**: Robust authentication via Supabase (Email/Password) with Row Level Security (RLS).
*   **🎨 Custom Themes**:
    *   Choose from built-in themes: *Fruits*, *Space*, *Animals*, *Sports*.
    *   **Upload Your Own**: Create a custom deck by uploading images (powered by Vercel Blob).
*   **🎚️ Difficulty Levels**:
    *   **4x4** (Easy)
    *   **4x6** (Medium)
    *   **6x6** (Hard)
*   **💾 Cloud Save**: Your game state is saved automatically to the database. Resume anytime across devices.
*   **📱 Fully Responsive**: Optimized for Desktop, Tablet, and Mobile play.
*   **🔊 8-Bit Sound**: Custom synthesizer sound effects for flips, matches, and victories (no assets required).

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (for user uploads)
*   **Font**: "Press Start 2P" (Google Fonts)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cardzy.git
cd cardzy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase and Vercel credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE=your_service_role_key

# Vercel Blob (For image uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 4. Database Migration
You need to set up the database schema in Supabase. Run the SQL commands from the following files in your **Supabase SQL Editor** in this order:

1.  **`supabase_schema.sql`**: Creates the `profiles`, `game_state`, and `leaderboard` tables with RLS policies.
2.  **`supabase_triggers.sql`**: Sets up the trigger to automatically create a profile when a user signs up.
3.  **`supabase_custom_images.sql`**: Adds support for custom image arrays in profiles.

**Important**: Ensure "Confirm Email" is enabled in your Supabase Auth settings for the signup flow to work as designed.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📂 Project Structure

*   **`app/`**: Next.js App Router pages and API routes.
    *   **`api/`**: Backend logic for game state (`start`, `click`, `resolve`, `save`), leaderboard, and uploads.
    *   **`game/`**: The main game interface.
    *   **`leaderboard/`**: Ranking table.
*   **`components/`**: Reusable UI components (e.g., `Tile.jsx`, `AuthProvider.jsx`).
*   **`hooks/`**: Custom hooks (e.g., `useGameSound.js`).
*   **`lib/`**: Utility functions (`supabase.js`, `board.js`, `helpers.js`).

## 🎮 How to Play

1.  **Sign Up**: Create an account to track your stats.
2.  **Start Game**: Default is 4x4 Fruits.
3.  **Match Cards**: Click tiles to flip them. Find all matching pairs.
4.  **Win**: Complete the board to submit your score to the Hall of Champions!
5.  **Customize**: Go to **Settings** (Gear Icon) to change Difficulty or Theme. Select "Custom" to upload your own photos!

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
