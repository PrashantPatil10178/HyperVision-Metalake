import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log("Request Sent:", config);

    const cookieFallback = localStorage.getItem("cookieFallback");

    const userID = localStorage.getItem("userID");
    if (userID) {
      config.headers["userID"] = userID;
    }
    if (cookieFallback) {
      try {
        const parsedCookie = JSON.parse(cookieFallback);
        const sessionKey = Object.keys(parsedCookie).find((key) =>
          key.startsWith("a_session_")
        );

        if (sessionKey) {
          config.headers["aSession"] = parsedCookie[sessionKey]; // Send only the session token
        }
      } catch (error) {
        console.error("Error parsing CookieFallback:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      // Handle unauthorized access (e.g., redirect to login)
    }
    return Promise.reject(error);
  }
);

export default api;
