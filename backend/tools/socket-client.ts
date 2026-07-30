import { io } from 'socket.io-client';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMDgxNTgzNi00NjUyLTQ0NjAtOTQ2ZS00OTg1MWI4YjBkZDciLCJpYXQiOjE3ODU0MjgyOTIsImV4cCI6MTc4NTUxNDY5Mn0.7cQw4kO2VlIfmFraoLnxlS8RLKk1raNUZT6pH3xKs2Q';

const socket = io('http://localhost:3000', {
  auth: {
    token,
  },
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  socket.emit('chat:join', {
    chatId: '47ef1390-ac16-48djhjy9-b5db-de368236a6bd',
  });
});

socket.on('chat:joined', (data) => {
  console.log('🎉 Joined chat:', data);
});

socket.on('chat:error', (error) => {
  console.log('❌ Chat error:', error);
});

socket.on('disconnect', () => {
  console.log('🔴 Disconnected');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});
