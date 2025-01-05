import axios from "axios";

// יצירת אינסטנס של Axios עם הגדרות ברירת מחדל
// const api = axios.create({
//     baseURL: process.env.REACT_APP_API_URL,// כתובת ה-API הבסיסית
   

//     headers: {
//         "Content-Type": "application/json", // הגדרות כותרות
//     },
    
// });
const apiUrl = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = "https://"+apiUrl;  // הגדרת baseURL לפי משתנה הסביבה או URL ברירת המחדל
console.log("API Base URL:", apiUrl);
axios.defaults.headers.common['Content-Type'] = 'application/json';
// הוספת Interceptor ל-Response
axios.interceptors.response.use(
    (response) => {
        // אם התשובה תקינה, מחזירים אותה כרגיל
        return response;
    },
    (error) => {
        if (error.response.status === 401) {
            alert("Invalid username or password.");
            return (window.location.href = "/");
          }
        // טיפול בשגיאה: כתיבה ללוג
        console.error(
            "Error in API call:",
            error.response?.status || "Unknown status",
            error.response?.data || error.message
        );

        // אפשר להוסיף כאן לוגיקה נוספת כמו רישום לדאטאבייס או הודעה למשתמש

        // זריקת השגיאה כדי לאפשר טיפול בפונקציות הקוראות
        return Promise.reject(error);
    }
);

export default api;
