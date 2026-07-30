import { io } from 'socket.io-client';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMDgxNTgzNi00NjUyLTQ0NjAtOTQ2ZS00OTg1MWI4YjBkZDciLCJpYXQiOjE3ODUzODMxNzUsImV4cCI6MTc4NTQ2OTU3NX0.sZ3w0LpMqwzka5GMPI-HZDFRyMCdb3jg_qr_pjj-UC4';

const socket = io('http://localhost:3000', {
  auth: {
    token,
  },
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 Disconnected');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});
