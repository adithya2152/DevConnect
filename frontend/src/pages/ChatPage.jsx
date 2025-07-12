import React, { useState } from 'react';
import { Box } from '@mui/material';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import InlineChatbox from '../components/chat/InlineChatbox';
/**
 * ChatPage Component
 * Main chat page that combines sidebar and chat window
 * Handles conversation selection and message sending
 * Integrates with API endpoints for real-time messaging
 */
function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  // Handle conversation selection from sidebar
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    // TODO: API call to mark conversation as read
    // markConversationAsRead(conversation.id);
  };

  // Handle sending new messages
  const handleSendMessage = async (conversationId, message) => {
    try {
      // TODO: API call to send message
      // const response = await fetch('/api/messages', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${userToken}`
      //   },
      //   body: JSON.stringify({
      //     conversationId,
      //     content: message.content,
      //     type: message.type
      //   })
      // });
      
      console.log('Sending message:', { conversationId, message });
      
      // TODO: Handle real-time updates via WebSocket
      // websocket.send(JSON.stringify({
      //   type: 'new_message',
      //   conversationId,
      //   message
      // }));
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Show error notification to user
    }
  };

  // Handle group creation
  const handleCreateGroup = async (groupData) => {
    try {
      // TODO: API call to create group
      // const response = await fetch('/api/groups', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${userToken}`
      //   },
      //   body: JSON.stringify(groupData)
      // });
      
      console.log('Creating group:', groupData);
      
      // TODO: Add new group to conversations list
      // setConversations(prev => [...prev, newGroup]);
      
      // Auto-select the newly created group
      setSelectedConversation(groupData);
      
    } catch (error) {
      console.error('Failed to create group:', error);
      // TODO: Show error notification to user
    }
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
        onSendMessage={handleSendMessage}
      />
      
      {/* Create Group Modal */}
      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    <InlineChatbox/>
    </Box>
  );
}

export default ChatPage;