// Jobs.tsx
"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import JobsTable from './JobsTable'; // Import the JobsTable component
import CreateJobDialog from './CreateJobDialog'; // Import the CreateJobDialog component
import ButtonGroup from '@mui/material/ButtonGroup';

export default function Jobs() {
  const [open, setOpen] = React.useState(false);
  const buttons = [
    <Button key="two">Modify a job</Button>,
    <Button key="three">Delete a job</Button>,
  ];
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <><Box sx={{ height: '100%', width: '100%' }}>
      
      <JobsTable /> 
      <Button variant="outlined" onClick={handleClickOpen}>
        Create a new job
      </Button>
      <CreateJobDialog open={open} onClose={handleClose} /> 
      <ButtonGroup color="primary" aria-label="Medium-sized button group">
        {buttons}
      </ButtonGroup>
    </Box></>
  );
}