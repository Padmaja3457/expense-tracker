import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://et-backend-7br8.onrender.com/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((note) => (
            <li key={note._id}>
              <p>{note.message}</p>
              <small>{new Date(note.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
