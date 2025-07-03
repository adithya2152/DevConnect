export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  stackOverflowUrl?: string;
  joinedDate: string;
  isOnline: boolean;
  connections: number;
  projects: number;
  communities: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  tags: string[];
  contributors: User[];
  status: 'active' | 'completed' | 'planning';
  createdAt: string;
  lastActivity: string;
  githubUrl?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  isJoined: boolean;
  lastActivity: string;
  tags: string[];
  privacy: 'public' | 'private';
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}

export interface AIResponse {
  type: 'suggestion' | 'roadmap' | 'people' | 'projects';
  title: string;
  content: string;
  items?: string[];
  users?: User[];
  projects?: Project[];
}