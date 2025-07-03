import { User, Project, Community, Conversation, Message } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  bio: 'Full-stack developer passionate about AI and open source. Building the future one commit at a time.',
  location: 'San Francisco, CA',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AI/ML', 'Docker'],
  linkedinUrl: 'https://linkedin.com/in/alexchen',
  githubUrl: 'https://github.com/alexchen',
  stackOverflowUrl: 'https://stackoverflow.com/users/alexchen',
  joinedDate: '2023-01-15',
  isOnline: true,
  connections: 542,
  projects: 23,
  communities: 8
};

export const users: User[] = [
  {
    id: '2',
    name: 'Sarah Rodriguez',
    email: 'sarah.r@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'ML Engineer | PhD in Computer Science | Building ethical AI systems',
    location: 'New York, NY',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'Kubernetes'],
    linkedinUrl: 'https://linkedin.com/in/sarahrodriguez',
    githubUrl: 'https://github.com/sarahrodriguez',
    stackOverflowUrl: 'https://stackoverflow.com/users/sarahrodriguez',
    joinedDate: '2022-11-20',
    isOnline: true,
    connections: 834,
    projects: 31,
    communities: 12
  },
  {
    id: '3',
    name: 'Marcus Thompson',
    email: 'marcus.t@example.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'DevOps Engineer | Cloud Architecture | Automation enthusiast',
    location: 'Austin, TX',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Go', 'Python'],
    githubUrl: 'https://github.com/marcusthompson',
    joinedDate: '2023-03-10',
    isOnline: false,
    connections: 423,
    projects: 18,
    communities: 6
  },
  {
    id: '4',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'Frontend Architect | React Expert | Design Systems advocate',
    location: 'London, UK',
    skills: ['React', 'TypeScript', 'CSS', 'Design Systems', 'Figma', 'Vue.js'],
    linkedinUrl: 'https://linkedin.com/in/priyapatel',
    githubUrl: 'https://github.com/priyapatel',
    stackOverflowUrl: 'https://stackoverflow.com/users/priyapatel',
    joinedDate: '2022-09-05',
    isOnline: true,
    connections: 721,
    projects: 45,
    communities: 15
  }
];

export const projects: Project[] = [
  {
    id: '1',
    name: 'AI Code Assistant',
    description: 'An intelligent code completion and suggestion tool powered by transformer models',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    tags: ['AI', 'Machine Learning', 'TypeScript', 'Python'],
    contributors: [currentUser, users[0], users[2]],
    status: 'active',
    createdAt: '2024-01-15',
    lastActivity: '2024-01-20',
    githubUrl: 'https://github.com/example/ai-code-assistant'
  },
  {
    id: '2',
    name: 'DevOps Automation Suite',
    description: 'Comprehensive CI/CD pipeline automation with monitoring and deployment tools',
    image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    tags: ['DevOps', 'Docker', 'Kubernetes', 'Go'],
    contributors: [users[1], users[2]],
    status: 'active',
    createdAt: '2023-12-01',
    lastActivity: '2024-01-19',
    githubUrl: 'https://github.com/example/devops-suite'
  },
  {
    id: '3',
    name: 'React Component Library',
    description: 'Modern, accessible React components following design system principles',
    image: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    tags: ['React', 'TypeScript', 'Design Systems', 'Storybook'],
    contributors: [users[3], currentUser],
    status: 'completed',
    createdAt: '2023-10-15',
    lastActivity: '2024-01-10',
    githubUrl: 'https://github.com/example/react-components'
  }
];

export const communities: Community[] = [
  {
    id: '1',
    name: 'AI Developers',
    description: 'Discuss the latest in AI development, share projects, and collaborate on cutting-edge ML solutions',
    image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    members: 1247,
    isJoined: true,
    lastActivity: '2024-01-20',
    tags: ['AI', 'Machine Learning', 'Python', 'TensorFlow'],
    privacy: 'public'
  },
  {
    id: '2',
    name: 'React Developers',
    description: 'Everything React - from hooks to performance optimization, component design to state management',
    image: 'https://images.pexels.com/photos/1181280/pexels-photo-1181280.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    members: 2156,
    isJoined: true,
    lastActivity: '2024-01-20',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    privacy: 'public'
  },
  {
    id: '3',
    name: 'DevOps Engineers',
    description: 'Cloud infrastructure, automation, monitoring, and best practices for modern development operations',
    image: 'https://images.pexels.com/photos/1181447/pexels-photo-1181447.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    members: 892,
    isJoined: false,
    lastActivity: '2024-01-19',
    tags: ['DevOps', 'AWS', 'Docker', 'Kubernetes'],
    privacy: 'public'
  },
  {
    id: '4',
    name: 'Open Source Contributors',
    description: 'Connect with other open source enthusiasts, find projects to contribute to, and share your work',
    image: 'https://images.pexels.com/photos/1181376/pexels-photo-1181376.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
    members: 3421,
    isJoined: true,
    lastActivity: '2024-01-20',
    tags: ['Open Source', 'GitHub', 'Collaboration'],
    privacy: 'public'
  }
];

export const conversations: Conversation[] = [
  {
    id: '1',
    participants: [currentUser, users[0]],
    lastMessage: {
      id: '1',
      sender: users[0],
      content: 'Hey Alex! I saw your AI project, would love to collaborate on the machine learning aspects.',
      timestamp: '2024-01-20T10:30:00Z',
      isRead: false
    },
    unreadCount: 2
  },
  {
    id: '2',
    participants: [currentUser, users[2]],
    lastMessage: {
      id: '2',
      sender: users[2],
      content: 'Thanks for the code review! I\'ve implemented your suggestions.',
      timestamp: '2024-01-19T16:45:00Z',
      isRead: true
    },
    unreadCount: 0
  }
];