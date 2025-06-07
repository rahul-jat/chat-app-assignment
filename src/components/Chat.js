import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, TextField, Button, Typography, Container, List, ListItem, ListItemText, AppBar, Toolbar, IconButton, Stack } from "@mui/material";

const MSG_TYPES = {
  USER_LIST: "USER_LIST",
  CHAT_HISTORY: "CHAT_HISTORY",
  SEND_MESSAGE: "SEND_MESSAGE",
  NEW_MESSAGE: "NEW_MESSAGE",
};
const CONNECTION_URL = "ws://localhost:9000";

const Chat = ({ user }) => {
  const [userList, setUserList] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const selectedFriendRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(CONNECTION_URL);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: MSG_TYPES.USER_LIST, data: { userId: user.id } }));
    };

    ws.onmessage = event => {
      const data = JSON.parse(event.data);

      if (data.type === MSG_TYPES.USER_LIST) {
        setUserList(data.users);
      } else if (data.type === MSG_TYPES.CHAT_HISTORY) {
        setChatHistory(data.messages);
      } else if (data.type === MSG_TYPES.NEW_MESSAGE) {
        const currentSelectedFriend = selectedFriendRef.current;
        if (currentSelectedFriend && (currentSelectedFriend.id === data.message.senderId || currentSelectedFriend.id === data.message.recipientId)) {
          setChatHistory(prevMessages => [...prevMessages, data.message]);
        }
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleSendMessage = e => {
    e.preventDefault();
    if (newMessage.trim()) {
      const data = {
        senderId: user.id,
        senderName: user.name,
        recipientId: selectedFriend.id,
        recipientName: selectedFriend.name,
        message: newMessage,
      };
      socket.send(JSON.stringify({ type: MSG_TYPES.SEND_MESSAGE, data: data }));
      setChatHistory([...chatHistory, data]);
      setNewMessage("");
    }
  };

  const handleSelectFriend = friend => {
    setSelectedFriend(friend);
    selectedFriendRef.current = friend;
    socket.send(JSON.stringify({ type: MSG_TYPES.CHAT_HISTORY, data: { senderId: user.id, recipientId: friend.id } }));
  };

  const handleLogout = () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ height: "100vh", display: "flex", flexDirection: "column", p: 0 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Messenger App
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Hello, {user.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            X
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Chat Window */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          m: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={2}>
            {userList.map(friend => (
              <Button key={friend.id} variant={selectedFriend && selectedFriend.id == friend.id ? "contained" : "outlined"} color="primary" onClick={() => handleSelectFriend(friend)}>
                {friend.name}
              </Button>
            ))}
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            maxHeight: "calc(100vh - 220px)",
          }}
        >
          <List>
            {chatHistory.map((message, index) => (
              <ListItem alignItems="flex-start" key={message.id}>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle2" color={message.senderId == user.id ? "secondary" : "primary"}>
                        {message.senderName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {message.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Message Input */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            size="small"
            disabled={!selectedFriend}
            autoFocus
          />
          <Button type="submit" variant="contained" disabled={!newMessage.trim()}>
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;
