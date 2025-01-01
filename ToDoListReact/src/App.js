// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Task from './Task';
import Register from './Register';
import Login from './Login';

function App() {
  return (
    <Router>
      <div>
        
        <Routes>
          {/* כאן מגדירים את הנתיבים */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tasks" element={<Task/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
