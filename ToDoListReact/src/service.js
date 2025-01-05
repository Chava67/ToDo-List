import api from './api';
import { jwtDecode } from 'jwt-decode';
setAuthorizationBearer();

function saveAccessToken(authResult) {
  localStorage.setItem("access_token", authResult.token);
  setAuthorizationBearer();
}

function setAuthorizationBearer() {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }
}

export default {

  getTasks: async () => {
    try {
      const result = await api.get("/tasks/");
      console.log('getTasks - Success', result.data);
      return result.data;
    } catch (error) {
      console.error('getTasks - Error:', error.message);
      throw error; // ממשיך להעלות את השגיאה למקרה שצריך לטפל בה במקום אחר
    }
  },

  addTask: async (task) => {
    try {
      await api.post("/tasks/", task);
      console.log('addTask - Success', task);
      return task;
    } catch (error) {
      console.error('addTask - Error:', error.message);
      throw error;
    }
  },

  setCompleted: async (id, isComplete) => {
    try {
      const result = await api.put(`/tasks/${id}`, { isComplete });
      console.log('setCompleted - Success', { id, isComplete });
      return result.data;
    } catch (error) {
      console.error('setCompleted - Error:', error.message);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      console.log('deleteTask - Success', id);
      return id;
    } catch (error) {
      console.error('deleteTask - Error:', error.message);
      throw error;
    }
  },



  register: async (userName, mail, password) => {
    
    console.log("Sending registration data...");
    console.log(mail);
    console.log("Data being sent:", { userName, mail, password });

    const res = await api.post("/register", {userName, mail, password });    
    console.log("Registration data sent");
    console.log(res);

  },
 
  
  login: async (userName, password, navigate) => {

    try {
      const res = await api.post("/login", { userName, password });
      if (res && res.data) {
        saveAccessToken(res.data);  // שמירה על ה-token
        navigate("/tasks"); // ניווט במקרה של הצלחה
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  },

};
