import React, { useState } from 'react';
import { Box } from '@mui/material';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import CreateGroupModal from '../components/chat/CreateGroupModal';

/**
 * ChatPage Component
 * Main chat page with real database integration
 */
function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  // Handle conversation selection from sidebar
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle group creation
  const handleCreateGroup = (groupData) => {
    // Auto-select the newly created group
    setSelectedConversation(groupData);
    setCreateGroupOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Chat Sidebar */}
      <ChatSidebar
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        onCreateGroup={() => setCreateGroupOpen(true)}
      />
      
      {/* Main Chat Window */}
      <ChatWindow
        conversation={selectedConversation}
      />
      
      {/* Create Group Modal */}
      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </Box>
  );
}

export default ChatPage;