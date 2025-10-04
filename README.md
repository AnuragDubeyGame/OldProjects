# Video Vault 🎥

A Google Photos clone for videos with YouTube-powered storage. Upload, organize, and discover your videos with unlimited free storage using your personal YouTube channel as the backend.

## ✨ Features

- **Unlimited Video Storage**: Uses your YouTube channel for free, unlimited video backup
- **Seamless Experience**: YouTube integration happens entirely in the background
- **Smart Search**: AI-powered search through video content using Google Cloud Video Intelligence
- **Modern UI**: Clean, responsive design with light/dark mode support
- **Video Gallery**: Infinite-scrolling grid with hover previews
- **Privacy First**: All videos uploaded as private to your YouTube channel
- **Cross-Platform**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Google Cloud Platform account
- YouTube Data API v3 enabled
- Google Cloud Video Intelligence API enabled
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VideoVault
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `.env` files in both `server/` and `client/` directories:

   **Server (.env)**
   ```env
   PORT=5000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
   JWT_SECRET=your_jwt_secret
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
   GOOGLE_CLOUD_CREDENTIALS=path_to_service_account_key.json
   ```

   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Setup Instructions

### Google Cloud Platform Setup

1. Create a new project in Google Cloud Console
2. Enable the following APIs:
   - YouTube Data API v3
   - Google Cloud Video Intelligence API
3. Create OAuth 2.0 credentials for web application
4. Create a service account and download the JSON key file
5. Set up the redirect URIs in your OAuth credentials

### Supabase Setup

1. Create a new Supabase project
2. Create the following tables:

   **users**
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     google_id TEXT UNIQUE NOT NULL,
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     picture TEXT,
     youtube_channel_id TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **videos**
   ```sql
   CREATE TABLE videos (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     youtube_video_id TEXT UNIQUE NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     thumbnail_url TEXT,
     duration INTEGER,
     file_size INTEGER,
     upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     ai_tags JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## 📱 User Journey

### First-Time Setup
1. Sign in with Google account
2. Grant YouTube permissions (creates channel if needed)
3. Start uploading and organizing videos

### Daily Usage
1. Upload videos via drag-and-drop or file picker
2. Browse your video gallery with infinite scroll
3. Search videos using AI-powered content detection
4. Play videos in full-screen mode
5. Manage videos (delete, download)

## 🏗️ Architecture

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth 2.0
- **Video Storage**: YouTube Data API v3
- **AI Analysis**: Google Cloud Video Intelligence API
- **State Management**: React Context + Supabase real-time

## 🔒 Security & Privacy

- All videos uploaded as private to YouTube
- OAuth tokens stored securely
- No video content stored on our servers
- User data encrypted in transit and at rest
- GDPR compliant data handling

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Dark/Light Mode**: Toggle between themes
- **Infinite Scroll**: Smooth browsing experience
- **Hover Previews**: Silent video previews on hover
- **Drag & Drop**: Easy video upload
- **Progress Indicators**: Real-time upload progress
- **Keyboard Navigation**: Full keyboard support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ for video enthusiasts everywhere.
