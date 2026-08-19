import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/unread');
      const cleanedNotifications = removeOldPeriodicNotifications(res.data);
      setNotifications(cleanedNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Function to remove old periodic notifications when new ones arrive
  const removeOldPeriodicNotifications = (notifs) => {
    // Sort notifications by date (newest first)
    const sortedNotifs = [...notifs].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Group notifications by exact message content
    const messageGroups = {};
    
    sortedNotifs.forEach(notification => {
      const exactMessage = notification.message;
      if (!messageGroups[exactMessage]) {
        messageGroups[exactMessage] = [];
      }
      messageGroups[exactMessage].push(notification);
    });

    const cleanedNotifications = [];
    
    // Process each group of identical messages
    Object.values(messageGroups).forEach(group => {
      if (group.length > 0) {
        // Keep the newest notification (first one since we sorted by date)
        cleanedNotifications.push(group[0]);
        
        // Delete older duplicates with exactly the same message
        group.slice(1).forEach(oldNotification => {
          deleteOldNotification(oldNotification.id);
        });
      }
    });

    // Sort final notifications by date (newest first)
    return cleanedNotifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const deleteOldNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('Error deleting old notification:', err);
    }
  };



  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Remove the notification from local state immediately
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // If there's an error, refresh the list to ensure sync with server
      fetchNotifications();
    }
  };

  return (
    <div className="notification-bell-container">
      <button className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((note) => (
              <div key={note.id} className="notification-item">
                <div className="notification-content">
                  <p>{note.message}</p>
                  {note.count > 1 && (
                    <span className="notification-count-badge">
                      +{note.count - 1} similar
                    </span>
                  )}
                  <small className="notification-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <button onClick={() => handleMarkAsRead(note.id)}>Mark as Read</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
