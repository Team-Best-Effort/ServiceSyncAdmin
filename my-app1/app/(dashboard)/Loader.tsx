import React from 'react';
import { CircleLoader } from 'react-spinners'; // Ensure react-spinners is installed

interface LoaderProps {
  size?: number;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 50, color = '#3498db' }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height
      }}
    >
      <CircleLoader size={size} color={color} />
    </div>
  );
};

export default Loader; // Default export