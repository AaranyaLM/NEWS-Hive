import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, visible, onHide, duration = 2000, type = 'success' }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onHide, duration]);

  return (
    <div className={`toast-notification ${visible ? 'visible' : ''} ${type}`}>
      {message}
    </div>
  );
};

export default Toast;