import React, { useState, useEffect } from 'react';

interface PermissionModalProps {
  type: 'camera' | 'microphone' | 'storage';
  onGranted: () => void;
  onDenied: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  type,
  onGranted,
  onDenied,
}) => {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      let result: any = 'prompt';
      
      if (type === 'camera') {
        result = await navigator.permissions.query({ name: 'camera' });
      } else if (type === 'microphone') {
        result = await navigator.permissions.query({ name: 'microphone' });
      }
      
      setPermissionState(result.state || 'prompt');
    } catch (error) {
      console.log('Permission API not supported, using legacy API');
    }
  };

  const requestPermission = async () => {
    try {
      if (type === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        onGranted();
      } else if (type === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        onGranted();
      } else if (type === 'storage') {
        // Storage permission - check if we can use localStorage
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        onGranted();
      }
      
      setPermissionState('granted');
    } catch (error) {
      console.error('Permission denied:', error);
      setPermissionState('denied');
      onDenied();
    }
  };

  const permissionTitle = {
    camera: 'Camera Access',
    microphone: 'Microphone Access',
    storage: 'Storage Access',
  }[type];

  const permissionDescription = {
    camera: 'We need camera access to record videos',
    microphone: 'We need microphone access to record audio',
    storage: 'We need storage access to save your files',
  }[type];

  if (permissionState === 'granted') {
    return null;
  }

  if (permissionState === 'denied') {
    return (
      <div className="permission-modal">
        <div className="modal-content">
          <h3>⚠️ Permission Denied</h3>
          <p>{permissionTitle} was denied. Please enable it in your browser settings.</p>
          <button onClick={onDenied} className="btn btn-secondary">
            Close
          </button>
        </div>
        
        <style>{`
          .permission-modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            background: #1a1a1a;
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            max-width: 300px;
          }
          .modal-content h3 {
            color: white;
            margin-bottom: 16px;
          }
          .modal-content p {
            color: rgba(255,255,255,0.7);
            margin-bottom: 24px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="permission-modal">
      <div className="modal-content">
        <h3>📷 {permissionTitle}</h3>
        <p>{permissionDescription}</p>
        <button onClick={requestPermission} className="btn btn-primary">
          Grant Permission
        </button>
      </div>
      
      <style>{`
        .permission-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #1a1a1a;
          padding: 24px;
          border-radius: 16px;
          text-align: center;
          max-width: 300px;
        }
        .modal-content h3 {
          color: white;
          margin-bottom: 16px;
        }
        .modal-content p {
          color: rgba(255,255,255,0.7);
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default PermissionModal;