"use client"; // Add this directive since we're using client-side functionality

import * as React from 'react';
import Typography from '@mui/material/Typography';
import JobsTable from './jobs/JobsTable';
import { Calendar } from './calendar/Calender';
import Loader from './Loader'; // Ensure this path is correct

export default function HomePage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Hardcoded user data for testing
  const user = {
    name: 'Mohammad Taufique Imrose', // Replace with functionality to get user data after implementing authentication
  };

  // Simulate loading delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Set loading to false after 2 seconds
    }, 500); 

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Display loader while loading
  if (isLoading) {
    return <Loader size={60} color="#3498db" />; // Customize size and color as needed
  }

  return (
    <div>
      <Typography>
        Welcome, <strong>{user.name}</strong>! {/* Display the logged username */}
      </Typography>
      <div style={{ marginBottom: '20px' }}>
        <Calendar />
      </div>
      <JobsTable />
    </div>
  );
}