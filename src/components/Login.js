import React, { useState } from "react";
import { Card, CardContent, CardActions, TextField, Button, Typography, Box, Container } from "@mui/material";

const Login = ({ setUser }) => {
  const [name, setName] = useState("");

  const handleChange = e => {
    setName(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const userName = name.trim();
    if (userName && userName.length > 0) {
      const response = await fetch("http://localhost:9000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData?.user);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Card sx={{ width: "100%", maxWidth: 400, padding: 2 }}>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Messenger App
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField fullWidth label="name" name="name" type="text" value={name} onChange={handleChange} margin="normal" required />
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button variant="contained" onClick={handleSubmit} disabled={!name.trim()} sx={{ width: "100px" }}>
              Chat
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
