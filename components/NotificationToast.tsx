
import React from 'react';
import { Notification } from '../types';

interface NotificationToastProps {
  notification: Notification;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: 'check_circle'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: 'error'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500',
          icon: 'warning'
        };
      default:
        return {
          bg: 'bg-primary',
          icon: 'info'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`${styles.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideUp min-w-[280px] max-w-[360px]`}>
      <span className="material-symbols-outlined fill-1">{styles.icon}</span>
      <span className="font-medium text-sm flex-1">{notification.message}</span>
    </div>
  );
};

export default NotificationToast;
