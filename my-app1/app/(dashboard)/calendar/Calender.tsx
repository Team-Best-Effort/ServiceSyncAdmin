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
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { ref, set, get, child, update, remove } from 'firebase/database';
import { db } from '../../../auth';

// Adjust the Task interface for Realtime Database
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
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setStart('');
    setEnd('');
  };

  const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!start) {
      return;
    }
    try {
      const newTaskRef = ref(db, `ServiceSync/${Date.now().toString()}`);
      const newTaskData = {
        title: title.trim() || 'Untitled',
        description: description.trim() || 'No description',
        status,
        start,
        end: end.trim() === '' ? null : end,
        createdAt: new Date().toISOString(),
      };
      await set(newTaskRef, newTaskData);
      setTasks([...tasks, { id: newTaskRef.key!, ...newTaskData }]);
      handleCloseAddDialog();
    } catch (e) {
      console.error('Error adding task: ', e);
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
    setSelectedTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setStart('');
    setEnd('');
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
        end: end.trim() === '' ? null : end,
        createdAt: selectedTask.createdAt,
      };
      await update(taskRef, updatedTaskData);
      const updatedTask: Task = { id: selectedTask.id, ...updatedTaskData };
      setTasks(tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t)));
      handleCloseModifyDialog();
    } catch (error) {
      console.error('Error updating task:', error);
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
      handleCloseDeleteDialog(); // Close the delete dialog after deletion
      handleCloseModifyDialog(); // Close the modify dialog after deletion
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  

  const handleEventClick = (arg: EventClickArg) => {
    const task = tasks.find((t) => t.id === arg.event.id);
    if (task) {
      handleOpenModifyDialog(task);
    }
  };

  const renderEventContent = (eventInfo: {
    timeText: string;
    event: { title: string; extendedProps: { description: string; status: string } };
  }) => {
    return (
      <>
        <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
        <br />
        <small>{eventInfo.event.extendedProps.description}</small>
      </>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      

      <FullCalendar
        height={400}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={true}
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
        PaperProps={{
          component: 'form',
          onSubmit: handleAddTask,
        }}
      >
        <DialogTitle>Create a Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a new task, please fill in the following information:
          </DialogContentText>
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
            onChange={(e) =>
              setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')
            }
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
            value={start ? start.slice(0, 16) : ''}
            onChange={(e) => setStart(new Date(e.target.value).toISOString())}
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
            value={end ? end.slice(0, 16) : ''}
            onChange={(e) => setEnd(new Date(e.target.value).toISOString())}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button type="submit">Add Task</Button>
        </DialogActions>
      </Dialog>
     

      {/* Modify Task Dialog */}
      <Dialog
        open={openModifyDialog}
        onClose={handleCloseModifyDialog}
        PaperProps={{
          component: 'form',
          onSubmit: handleModifyTask,
        }}
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To modify the task, please update the following information:
          </DialogContentText>
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
            onChange={(e) =>
              setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')
            }
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
            value={start ? start.slice(0, 16) : ''}
            onChange={(e) => setStart(new Date(e.target.value).toISOString())}
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
            value={end ? end.slice(0, 16) : ''}
            onChange={(e) => setEnd(new Date(e.target.value).toISOString())}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModifyDialog}>Cancel</Button>
          <Button onClick={() => selectedTask && handleOpenDeleteDialog(selectedTask) && {handleCloseModifyDialog}} color="error">
            Delete
          </Button>
          <Button type="submit">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteTask}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Button variant="contained" onClick={handleOpenAddDialog} style={{ marginTop: '20px' }}>
        Add New Task
      </Button>
      

    </div>
  );
}
