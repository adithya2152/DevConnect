// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Box,
//   TextField,
//   IconButton,
//   Paper,
//   Typography,
//   Card,
//   CardContent,
//   Chip,
//   Divider,
// } from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';

// const marshGreen = '#0e6672ff';

// const InlineChatBox = () => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const bottomRef = useRef(null);
//   const [loading, setLoading] = useState(false);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const userMessage = {
//       sender: 'You',
//       content: input,
//       time: new Date().toLocaleTimeString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInput('');
//     setLoading(true);

//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_KEY}/chat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: userMessage.content }),
//       });

//       const data = await response.json();

//       const botMessage = {
//         sender: 'DevBot',
//         content: data.message || 'No response from DevBot.',
//         time: new Date().toLocaleTimeString(),
//         results: data.results || [],
//       };

//       setMessages((prev) => [...prev, botMessage]);
//     } catch (err) {
//       console.error('Chat error:', err);
//       setMessages((prev) => [
//         ...prev,
//         {
//           sender: 'DevBot',
//           content: 'Something went wrong. Please try again later.',
//           time: new Date().toLocaleTimeString(),
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const renderResults = (results) => {
//     return results.map((item, i) => (
//       <Card
//         key={i}
//         sx={{
//           bgcolor: '#111',
//           border: `1px solid ${marshGreen}`,
//           mb: 2,
//         }}
//       >
//         <CardContent>
//           {/* Project or profile card */}
//           {item.title ? (
//             <>
//               <Typography variant="h6" color="white">
//                 {item.title}
//               </Typography>
//               <Typography variant="body2" sx={{ color: '#ccc' }}>
//                 {item.description}
//               </Typography>
//               <Divider sx={{ my: 1, borderColor: marshGreen }} />
//               {item.tech_stack?.length > 0 && (
//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                   {item.tech_stack.map((tech, j) => (
//                     <Chip key={j} label={tech} size="small" sx={{ bgcolor: marshGreen, color: '#000' }} />
//                   ))}
//                 </Box>
//               )}
//               {item.score && (
//                 <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
//                   Match Score: {item.score}
//                 </Typography>
//               )}
//             </>
//           ) : (
//             <>
//               <Typography variant="h6" color="white">
//                 {item.full_name || item.username}
//               </Typography>
//               {item.username && (
//                 <Typography variant="body2" sx={{ color: '#ccc' }}>
//                   @{item.username}
//                 </Typography>
//               )}
//               {item.score && (
//                 <Typography variant="caption" sx={{ color: '#888' }}>
//                   Match Score: {item.score}
//                 </Typography>
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>
//     ));
//   };

//   return (
//     <Paper
//       elevation={6}
//       sx={{
//         position: 'fixed',
//         bottom: 20,
//         right: 20,
//         width: 800,
//         maxHeight: '80vh',
//         display: 'flex',
//         flexDirection: 'column',
//         borderRadius: 3,
//         overflow: 'hidden',
//         zIndex: 1300,
//         bgcolor: '#000',
//         border: `2px solid ${marshGreen}`,
//       }}
//     >
//       {/* Top Bar */}
//       <Box sx={{ p: 1.5, bgcolor: '#000', borderBottom: `1px solid ${marshGreen}` }}>
//         <Typography variant="subtitle1" fontWeight="bold" color={marshGreen}>
//           DevConnect Chat
//         </Typography>
//       </Box>

//       {/* Messages */}
//       <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
//         {messages.map((msg, i) => (
//           <Box key={i} sx={{ mb: 2 }}>
//             <Typography variant="body2" fontWeight="bold" sx={{ color: marshGreen }}>
//               {msg.sender}
//             </Typography>
//             <Typography variant="body2" sx={{ color: 'white', whiteSpace: 'pre-wrap' }}>
//               {msg.content}
//             </Typography>
//             {msg.results && renderResults(msg.results)}
//             <Typography variant="caption" sx={{ color: '#888' }}>
//               {msg.time}
//             </Typography>
//           </Box>
//         ))}
//         {loading && (
//           <Typography variant="body2" sx={{ color: marshGreen, fontStyle: 'italic' }}>
//             DevBot is typing...
//           </Typography>
//         )}
//         <div ref={bottomRef} />
//       </Box>

//       {/* Input Box */}
//       <Box sx={{ display: 'flex', p: 1, borderTop: `1px solid ${marshGreen}` }}>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//           sx={{
//             input: { color: 'white' },
//             bgcolor: '#111',
//             borderRadius: 2,
//           }}
//           disabled={loading}
//         />
//         <IconButton onClick={handleSend} sx={{ color: marshGreen }} disabled={loading}>
//           <SendIcon />
//         </IconButton>
//       </Box>
//     </Paper>
//   );
// };

// export default InlineChatBox;


import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Tooltip,
  Fab,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const marshGreen = '#00ffab';

const InlineChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false); // 💬 collapse mode
  const bottomRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: 'You',
      content: input,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_KEY}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data = await response.json();

      const botMessage = {
        sender: 'DevBot',
        content: data.message || 'No response from DevBot.',
        time: new Date().toLocaleTimeString(),
        results: data.results || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'DevBot',
          content: 'Something went wrong. Please try again later.',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderResults = (results) =>
    results.map((item, i) => (
      <Card
        key={i}
        sx={{
          bgcolor: '#1e1e1e',
          border: `1px solid ${marshGreen}`,
          mb: 2,
          borderRadius: 2,
          boxShadow: '0 0 10px rgba(0,255,171,0.2)',
        }}
      >
        <CardContent>
          {item.title ? (
            <>
              <Typography variant="h6" color="white">
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                {item.description}
              </Typography>
              <Divider sx={{ my: 1, borderColor: marshGreen }} />
              {item.tech_stack?.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {item.tech_stack.map((tech, j) => (
                    <Chip
                      key={j}
                      label={tech}
                      size="small"
                      sx={{ bgcolor: marshGreen, color: '#000' }}
                    />
                  ))}
                </Box>
              )}
              {item.score && (
                <Typography
                  variant="caption"
                  sx={{ color: '#888', mt: 1, display: 'block' }}
                >
                  Match Score: {item.score}
                </Typography>
              )}
            </>
          ) : (
            <>
              <Typography variant="h6" color="white">
                {item.full_name || item.username}
              </Typography>
              {item.username && (
                <Typography variant="body2" sx={{ color: '#ccc' }}>
                  @{item.username}
                </Typography>
              )}
              {item.score && (
                <Typography variant="caption" sx={{ color: '#888' }}>
                  Match Score: {item.score}
                </Typography>
              )}
            </>
          )}
        </CardContent>
      </Card>
    ));

  return (
    <>
      {!expanded && (
        <Tooltip title="Chat with DevBot">
          <Fab
            onClick={() => setExpanded(true)}
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              bgcolor: marshGreen,
              color: '#000',
              boxShadow: '0 0 15px rgba(0,255,171,0.4)',
              '&:hover': {
                bgcolor: '#00e6a1',
              },
              zIndex: 1300,
            }}
          >
            <ChatIcon />
          </Fab>
        </Tooltip>
      )}

      {expanded && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 400,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            overflow: 'hidden',
            zIndex: 1300,
            bgcolor: 'rgba(17, 24, 39, 0.9)',
            border: `2px solid ${marshGreen}`,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(0,255,171,0.2)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${marshGreen}`,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: marshGreen }}
            >
              DevConnect Chat
            </Typography>
            <IconButton onClick={() => setExpanded(false)} sx={{ color: marshGreen }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              scrollbarWidth: 'thin',
            }}
          >
            {messages.map((msg, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ color: msg.sender === 'DevBot' ? marshGreen : '#60a5fa' }}
                >
                  {msg.sender}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    whiteSpace: 'pre-wrap',
                    backgroundColor:
                      msg.sender === 'DevBot' ? '#1e1e1e' : '#1f2937',
                    p: 1.2,
                    px: 2,
                    borderRadius: 2,
                    mt: 0.5,
                    borderLeft: `4px solid ${
                      msg.sender === 'DevBot' ? marshGreen : '#60a5fa'
                    }`,
                  }}
                >
                  {msg.content}
                </Typography>
                {msg.results && renderResults(msg.results)}
                <Typography variant="caption" sx={{ color: '#888' }}>
                  {msg.time}
                </Typography>
              </Box>
            ))}
            {loading && (
              <Typography
                variant="body2"
                sx={{ color: marshGreen, fontStyle: 'italic' }}
              >
                DevBot is typing...
              </Typography>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Input Box */}
          <Box
            sx={{ display: 'flex', p: 1.2, borderTop: `1px solid ${marshGreen}` }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              sx={{
                bgcolor: '#1f2937',
                borderRadius: 2,
                input: { color: 'white' },
                mr: 1,
              }}
              disabled={loading}
            />
            <IconButton
              onClick={handleSend}
              sx={{
                color: marshGreen,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.2)',
                  color: '#00ffa1',
                },
              }}
              disabled={loading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default InlineChatBox;
