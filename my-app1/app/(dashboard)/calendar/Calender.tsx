'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Button from '@mui/material/Button';
import { EventClickArg } from '@fullcalendar/core';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { ref, set, get, child, update, remove } from 'firebase/database';
import { db } from '../../../auth';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  start: string;
  end?: string | null;
  createdAt: string;
}

export function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openModifyDialog, setOpenModifyDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'ServiceSync'));
        if (snapshot.exists()) {
          const serviceSyncData = snapshot.val();
          const tasksList: Task[] = Object.entries(serviceSyncData).map(([key, value]) => ({
            id: key,
            ...(value as Omit<Task, 'id'>),
          }));
          setTasks(tasksList);
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.warn('Failed to fetch tasks from Firebase:', error);
      }
    };
    fetchTasks();
  }, []);

  const handleOpenAddDialog = () => setOpenAddDialog(true);

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    resetForm();
  };

  const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!start) return;
    try {
      const newTaskRef = ref(db, `ServiceSync/${Date.now().toString()}`);
      const newTaskData = {
        title: title.trim() || 'Untitled',
        description: description.trim() || 'No description',
        status,
        start,
        end: end || null,
        createdAt: new Date().toISOString(), // This is the only place we use ISO for createdAt
      };
      await set(newTaskRef, newTaskData);
      setTasks([...tasks, { id: newTaskRef.key!, ...newTaskData }]);
      handleCloseAddDialog();
    } catch (error) {
      console.warn('Could not add task:', error);
    }
  };

  const handleOpenModifyDialog = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setStart(task.start);
    setEnd(task.end || '');
    setOpenModifyDialog(true);
  };

  const handleCloseModifyDialog = () => {
    setOpenModifyDialog(false);
    resetForm();
  };

  const handleModifyTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask || !start) return;
    try {
      const taskRef = ref(db, `ServiceSync/${selectedTask.id}`);
      const updatedTaskData = {
        title: title.trim() || 'Untitled',
        description: description.trim() || 'No description',
        status,
        start,
        end: end || null,
        createdAt: selectedTask.createdAt,
      };
      await update(taskRef, updatedTaskData);
      setTasks(tasks.map((t) => (t.id === selectedTask.id ? { id: selectedTask.id, ...updatedTaskData } : t)));
      handleCloseModifyDialog();
    } catch (error) {
      console.warn('Task update failed:', error);
    }
  };

  const handleOpenDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      const taskRef = ref(db, `ServiceSync/${selectedTask.id}`);
      await remove(taskRef);
      setTasks(tasks.filter((t) => t.id !== selectedTask.id));
      handleCloseDeleteDialog();
      handleCloseModifyDialog();
    } catch (error) {
      console.warn('Task deletion unsuccessful:', error);
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const task = tasks.find((t) => t.id === arg.event.id);
    if (task) handleOpenModifyDialog(task);
  };

  const renderEventContent = (eventInfo: {
    timeText: string;
    event: { title: string; extendedProps: { description: string; status: string } };
  }) => (
    <>
      <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
      <br />
      <small>{eventInfo.event.extendedProps.description}</small>
    </>
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('pending');
    setStart('');
    setEnd('');
    setSelectedTask(null);
  };

  // No conversion, just store the datetime-local value as-is
  const handleDateTimeChange = (value: string) => {
    return value || '';
  };

  // No conversion needed, the stored value is already in datetime-local format
  const formatDateTimeLocal = (value: string) => {
    return value || '';
  };

  return (
    <div style={{ padding: '20px' }}>
      <FullCalendar
        height={800}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={true}
        timeZone="local" // Use the system's local timezone
        events={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          start: task.start,
          end: task.end || undefined,
          extendedProps: { description: task.description, status: task.status },
        }))}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
      />

      {/* Add Task Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        PaperProps={{ component: 'form', onSubmit: handleAddTask }}
      >
        <DialogTitle>Create an Event</DialogTitle>
        <DialogContent>
          <DialogContentText>To add a new event, please fill in the following information:</DialogContentText>
          <TextField
            autoFocus
            required
            margin="normal"
            id="title"
            name="title"
            label="Title"
            fullWidth
            variant="filled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            required
            margin="normal"
            id="description"
            name="description"
            label="Description"
            fullWidth
            variant="filled"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={status}
            label="Status"
            fullWidth
            onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
          <TextField
            required
            margin="normal"
            id="start"
            name="start"
            label="Start Date"
            type="datetime-local"
            fullWidth
            variant="filled"
            value={formatDateTimeLocal(start)}
            onChange={(e) => setStart(handleDateTimeChange(e.target.value))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            id="end"
            name="end"
            label="End Date (optional)"
            type="datetime-local"
            fullWidth
            variant="filled"
            value={formatDateTimeLocal(end)}
            onChange={(e) => setEnd(handleDateTimeChange(e.target.value))}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button type="submit">Add Event</Button>
        </DialogActions>
      </Dialog>

      {/* Modify Task Dialog */}
      <Dialog
        open={openModifyDialog}
        onClose={handleCloseModifyDialog}
        PaperProps={{ component: 'form', onSubmit: handleModifyTask }}
      >
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <DialogContentText>To modify the event, please update the following information:</DialogContentText>
          <TextField
            required
            margin="normal"
            id="title"
            name="title"
            label="Title"
            fullWidth
            variant="filled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            required
            margin="normal"
            id="description"
            name="description"
            label="Description"
            fullWidth
            variant="filled"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={status}
            label="Status"
            fullWidth
            onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
          <TextField
            required
            margin="normal"
            id="start"
            name="start"
            label="Start Date"
            type="datetime-local"
            fullWidth
            variant="filled"
            value={formatDateTimeLocal(start)}
            onChange={(e) => setStart(handleDateTimeChange(e.target.value))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            id="end"
            name="end"
            label="End Date (optional)"
            type="datetime-local"
            fullWidth
            variant="filled"
            value={formatDateTimeLocal(end)}
            onChange={(e) => setEnd(handleDateTimeChange(e.target.value))}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModifyDialog}>Cancel</Button>
          <Button onClick={() => selectedTask && handleOpenDeleteDialog(selectedTask)} color="error">
            Delete
          </Button>
          <Button type="submit">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this event?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTask}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Button variant="contained" onClick={handleOpenAddDialog} style={{ marginTop: '20px' }}>
        Add New Event
      </Button>
    </div>
  );
}