# DevConnect 🚀

**Your developer network. Collaborate. Build. Ship.**

DevConnect is a comprehensive platform designed for developers to connect, collaborate, and build projects together. It combines social networking features with project management tools, real-time chat, and community building capabilities.

## ✨ Features

### 🔐 Authentication & User Management
- **Email-based OTP verification** for secure registration
- **JWT-based authentication** with Supabase
- **User profiles** with customizable avatars and bios
- **Social connections** - follow/unfollow other developers
- **Profile customization** with skills, location, and social links

### 👥 Social Networking
- **Developer profiles** with GitHub, LinkedIn, and StackOverflow integration
- **Connection system** to build your professional network
- **Activity feeds** and notifications
- **Real-time status** indicators (online/offline)

### 🚀 Project Management
- **Create and manage projects** with detailed descriptions
- **Project applications** - apply to join projects or invite team members
- **Project rooms** for team collaboration
- **Project status tracking** (active, completed, on hold, cancelled)
- **Skill-based matching** and project recommendations
- **Team size management** and role assignments

### 💬 Real-time Communication
- **Private messaging** between users
- **Project team chats** for collaboration
- **Community chat rooms** for topic-based discussions
- **WebSocket-based real-time messaging**
- **Message history** and conversation management

### 🏘️ Community Features
- **Create and join communities** based on interests
- **Community chat rooms** for discussions
- **Community management** (public/private)
- **Member management** and moderation tools

### 🔍 Smart Search & Discovery
- **AI-powered intent extraction** for better search results
- **Advanced filtering** by skills, domains, project types
- **Recommendation system** for projects and people
- **Real-time search** with debounced queries

### 📱 Modern UI/UX
- **Responsive design** that works on all devices
- **Dark theme** with gradient backgrounds
- **Material-UI components** for consistent design
- **Smooth animations** and transitions
- **Toast notifications** for user feedback

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite for fast development
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Date-fns** for date manipulation
- **JWT Decode** for token handling

### Backend
- **FastAPI** for high-performance API
- **Python 3.x** with async/await support
- **Supabase** for database and authentication
- **WebSocket** for real-time communication
- **OpenAI/OpenRouter** for AI features
- **Python-dotenv** for environment management
- **Uvicorn** as ASGI server

### Database
- **PostgreSQL** via Supabase
- **Real-time subscriptions** for live updates
- **Row Level Security (RLS)** for data protection

### AI & ML
- **OpenAI API** for intent extraction
- **Embedding-based search** for smart recommendations
- **Natural language processing** for chat features

## 📁 Project Structure

```
DevConnect/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   └── ...
│   │   ├── api/            # API integration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── data/           # Static data and constants
│   │   ├── styles/         # CSS and styling
│   │   └── assets/         # Images and static files
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── backend/                 # FastAPI backend application
│   ├── auth/               # Authentication modules
│   ├── chat/               # Chat functionality
│   ├── community/          # Community features
│   ├── search/             # Search and recommendation
│   ├── main.py             # Main FastAPI application
│   ├── db.py               # Database operations
│   ├── requirements.txt    # Python dependencies
│   └── ...
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **Git**
- **Supabase account** for database
- **OpenAI API key** for AI features

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevConnect
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Environment Variables**

   Create `.env` files in both frontend and backend directories:

   **Backend `.env`:**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_KEY_SERVICE = your_supabase_service_key
   SUPABASE_SERVICE_KEY=your_supabase_servide_key
   SUPABASE_JWT_SECRET=your_supabase_JWT_secret
   SUPABASE_PROJECT_ID=supabase_project_id
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   EMAIL_ADDRESS=your_email
   EMAIL_PASSWORD=your_email)password_generated_after_2FA
   OPENROUTER_API_KEY=your_openrouter_api_key
   NVIDIA_API_KEY=your_nvdia_api_key
   
   ```

   **Frontend `.env`:**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_KEY=http://localhost:8000 #https://devconnect-fbng.onrender.com
   MODE=development
   ```

### Database Setup

1. **Create Supabase project** and get your credentials
2. **Run the SQL scripts** in your Supabase SQL editor:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id uuid REFERENCES auth.users ON DELETE CASCADE,
     email text,
     username text,
     full_name text,
     avatar_url text,
     bio text,
     location text,
     skills text[],
     linkedin_url text,
     github_url text,
     stackoverflow_url text,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now(),
     PRIMARY KEY (id)
   );

   -- Create app_projects table
   CREATE TABLE app_projects (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     title text NOT NULL,
     description text NOT NULL,
     detailed_description text,
     status text DEFAULT 'active',
     project_type text,
     domain text,
     difficulty_level text DEFAULT 'intermediate',
     required_skills text[],
     tech_stack text[],
     programming_languages text[],
     estimated_duration text,
     team_size_min integer DEFAULT 1,
     team_size_max integer DEFAULT 5,
     is_remote boolean DEFAULT true,
     timezone_preference text,
     github_url text,
     demo_url text,
     figma_url text,
     documentation_url text,
     image_url text,
     is_recruiting boolean DEFAULT true,
     is_public boolean DEFAULT true,
     collaboration_type text DEFAULT 'open',
     created_by uuid REFERENCES profiles(id),
     tags text[],
     view_count integer DEFAULT 0,
     like_count integer DEFAULT 0,
     application_count integer DEFAULT 0,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now(),
     deadline timestamptz,
     started_at timestamptz,
     completed_at timestamptz
   );

   -- Create app_project_members table
   CREATE TABLE app_project_members (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id uuid REFERENCES app_projects(id) ON DELETE CASCADE,
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     role text DEFAULT 'member',
     status text DEFAULT 'pending',
     joined_at timestamptz DEFAULT now(),
     contribution_description text,
     UNIQUE(project_id, user_id)
   );

   -- Create rooms table
   CREATE TABLE rooms (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name text NOT NULL,
     type text DEFAULT 'private',
     description text,
     created_by uuid REFERENCES profiles(id),
     created_at timestamptz DEFAULT now()
   );

   -- Create private_rooms table
   CREATE TABLE private_rooms (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
     user1_id uuid REFERENCES profiles(id),
     user2_id uuid REFERENCES profiles(id),
     UNIQUE(room_id)
   );

   -- Create room_members table
   CREATE TABLE room_members (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     role text DEFAULT 'member',
     joined_at timestamptz DEFAULT now(),
     UNIQUE(room_id, user_id)
   );

   -- Create messages table
   CREATE TABLE messages (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
     sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     content text NOT NULL,
     message_type text DEFAULT 'text',
     created_at timestamptz DEFAULT now()
   );

   -- Create notifications table
   CREATE TABLE notifications (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     type text NOT NULL,
     title text NOT NULL,
     message text NOT NULL,
     reference_id uuid,
     is_read boolean DEFAULT false,
     created_at timestamptz DEFAULT now()
   );

   -- Create communities table
   CREATE TABLE communities (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name text NOT NULL,
     description text,
     image_url text,
     created_by uuid REFERENCES profiles(id),
     is_public boolean DEFAULT true,
     created_at timestamptz DEFAULT now()
   );

   -- Create community_members table
   CREATE TABLE community_members (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
     user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     role text DEFAULT 'member',
     joined_at timestamptz DEFAULT now(),
     UNIQUE(community_id, user_id)
   );

   -- Create user_connections table
   CREATE TABLE user_connections (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
     created_at timestamptz DEFAULT now(),
     UNIQUE(follower_id, following_id)
   );
   ```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 API Endpoints

### Authentication
- `POST /send-otp` - Send OTP to email
- `POST /verify-otp` - Verify OTP
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### Projects
- `GET /api/app_projects_with_members` - Get all projects with members
- `POST /api/app_projects` - Create new project
- `POST /api/app_project_members` - Apply to project
- `GET /api/projects/{project_id}/applications` - Get project applications
- `PATCH /api/app_project_members/{member_id}/accept` - Accept application
- `PATCH /api/app_project_members/{member_id}/deny` - Deny application

### Chat
- `GET /chat/conversations` - Get user conversations
- `GET /chat/messages/{room_id}` - Get room messages
- `POST /chat/send` - Send message
- `WebSocket /ws` - Real-time messaging

### Communities
- `GET /communities/explore` - Explore communities
- `GET /communities/joined` - Get joined communities
- `POST /communities/create` - Create community
- `POST /communities/join` - Join community

### Search
- `GET /search/people` - Search for developers
- `GET /search/projects` - Search for projects
- `POST /search/recommend` - Get AI recommendations



 
## 🙏 Acknowledgments

- **Supabase** for the excellent backend-as-a-service platform
- **Material-UI** for the beautiful component library
- **FastAPI** for the high-performance web framework
- **OpenAI** for the AI capabilities  
- **React** and **Vite** for the modern frontend development experience

## 📞 Support

If you have any questions or need help:
- Create an issue in the repository
- Join our community discussions
- Check the documentation
---

## 👨‍💻 Developers

Meet the brains and builders behind **DevConnect**:

| | Name | Role | GitHub | LinkedIn |
|--------|------|------|--------|----------|
| <img src="https://github.com/adithya2152.png" width="40" height="40" style="border-radius:50%;" /> | **Adithya Bharadwaj** | Full Stack Developer | [@adithya2152](https://github.com/adithya2152) | [LinkedIn](https://www.linkedin.com/in/adithya-bharadwaj-c-5701712a6/) |
| <img src="https://github.com/ajitha26.png" width="40" height="40" style="border-radius:50%;" /> | **Ajitha Arvinth** | AI & Full Stack Developer| [@ajitha26](https://github.com/ajitha26) | [LinkedIn](https://www.linkedin.com/in/ajitha-arvinth-2953152b9/) |
| <img src="https://github.com/Harith-Y.png" width="40" height="40" style="border-radius:50%;" /> | **Harith Yerragolam** | Full Stack Developer | [@Harith-Y](https://github.com/Harith-Y) | [LinkedIn](https://www.linkedin.com/in/harith-yerragolam/) 


**Built with ❤️ for the developer community**

