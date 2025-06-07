import { useState } from "react";
import "./App.css";
import Login from "./components/Login";
import Chat from "./components/Chat";

function App() {
  const [user, setUser] = useState();

  return <>{user ? <Chat user={user} /> : <Login setUser={setUser} />}</>;
}

export default App;
