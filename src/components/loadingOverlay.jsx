// LoadingOverlay.jsx
import React from 'react';

const LoadingOverlay = () => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(255, 255, 255, 0.7)', // làm mờ
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999, // đảm bảo nằm trên cùng
            }}
        >
            <div className="spinner-border text-primary" role="status" />
        </div>
    );
};

export default LoadingOverlay;
