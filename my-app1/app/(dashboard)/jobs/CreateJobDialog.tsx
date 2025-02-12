// CreateJobDialog.tsx
"use client";
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

interface CreateJobDialogProps {
  open: boolean;
  onClose: () => void;
}
export default function CreateJobDialog({ open, onClose }: CreateJobDialogProps) {

  const [age, setAge] = React.useState('');
  const [age2, setAge2] = React.useState('');
  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
    setAge2(event.target.value as string);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const email = formJson.email;
          console.log(email);
          onClose();
        },
      }}
    >
      <DialogTitle>Create a job</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add a new job please fill in the following information:
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin="normal"
          id="name"
          name="jobid"
          label="Job ID"
          fullWidth
          variant="filled"
        />
        <InputLabel id="select-label">Job Type</InputLabel>
        <Select
          labelId="select-label"
          fullWidth
          id="select"
          value={age}
          label="Job Type"
          onChange={handleChange}
        >
          <MenuItem value={10}>Plumbing</MenuItem>
          <MenuItem value={20}>Other</MenuItem>
          <MenuItem value={30}>Other</MenuItem>
          <MenuItem value={40}>Other</MenuItem>
        </Select>
        <InputLabel id="select-label2">Assign to:</InputLabel>
        <Select
          labelId="select-label2"
          fullWidth
          id="select2"
          value={age2}
          label="Age"
          onChange={handleChange}
        >
          <MenuItem value={50}>Ethan Caldwell</MenuItem>
          <MenuItem value={60}>Sophia Reyes</MenuItem>
          <MenuItem value={70}>Lucas Bennett</MenuItem>
          <MenuItem value={80}>Nathaniel Hayes</MenuItem>
        </Select>
        <TextField
          autoFocus
          required
          margin="normal"
          id="name"
          name="jobid"
          label="Address"
          fullWidth
          variant="filled"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
}