'use client';

import React, { useState, useEffect } from 'react';
import { Divider, Typography, Stack } from '@mui/material';
import { db } from '../(dashboard)/jobs/lib/firebase';
import { ref, get, child } from 'firebase/database';
import { format, isToday, isSameDay } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  start: string;
  end?: string | null;
  createdAt: string;
}

export function UpcomingEvents() {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [pastTasks, setPastTasks] = useState<Task[]>([]);

  // Fetch tasks from Firebase
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

          // Get current local time
          const now = new Date();

          // Log all tasks for debugging
          console.log('All tasks:', tasksList);

          // Filter for today's events by comparing year, month, and day
          const todayTasks = tasksList.filter((task) => {
            const taskDate = new Date(task.start);
            const isTodayEvent = isSameDay(taskDate, now);
            console.log(
              `Task ID: ${task.id}, Start: ${task.start}, Parsed Date: ${taskDate.toISOString()}, Is Today: ${isTodayEvent}`
            );
            return isTodayEvent;
          });

          // Log filtered tasks
          console.log('Today’s tasks:', todayTasks);

          // Filter and sort upcoming tasks (future events for today)
          const upcoming = todayTasks
            .filter((task) => new Date(task.start).getTime() > now.getTime())
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

          // Filter and sort past tasks (past events for today, most recent first)
          const past = todayTasks
            .filter((task) => new Date(task.start).getTime() <= now.getTime())
            .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

          setUpcomingTasks(upcoming);
          setPastTasks(past);
        } else {
          console.log('No tasks found in Firebase.');
        }
      } catch (error) {
        console.warn('Failed to fetch tasks from Firebase:', error);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div
      style={{
        padding: '2px',
        maxWidth: '500px',
        maxHeight: '380px',
        minHeight: '380px',
        margin: 'auto',
      }}
    >
      <Stack
        spacing={2}
        sx={{
          backgroundColor: 'background.paper', 
          borderRadius: '8px',
          padding: '10px',
        }}
      >
        <Typography component="h2" variant="subtitle2">
                  Today's Events
                </Typography>
        {/* Upcoming Events Section */}
        <Stack spacing={1}>
          <Typography component="h2" variant="subtitle2">
                    Upcoming Events
                  </Typography>
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <Stack
                key={task.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: 'background.default', // Slightly different background for event rows
                  '&:hover': { backgroundColor: 'action.hover' }, // Theme hover effect
                  transition: 'background-color 0.2s',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                  {task.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: 'success.main' }} // Green accent for upcoming times
                >
                  {format(new Date(task.start), 'h:mm a')}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              No upcoming events for today.
            </Typography>
          )}
        </Stack>

        {/* Divider between sections */}
        <Divider sx={{ borderColor: 'divider' }} />

        {/* Past Events Section */}
        <Stack spacing={1}>
          <Typography component="h2" variant="subtitle2">
                    Past Events
                  </Typography>
          {pastTasks.length > 0 ? (
            pastTasks.map((task) => (
              <Stack
                key={task.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: 'background.default', // Same background for past events
                  '&:hover': { backgroundColor: 'action.hover' }, // Theme hover effect
                  transition: 'background-color 0.2s',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                  {task.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', color: 'text.secondary' }} // Muted color for past event times
                >
                  {format(new Date(task.start), 'h:mm a')}
                </Typography>
              </Stack>
            ))
          ) : (
            <Typography component="h2" variant="subtitle2">
                   No Past events for today
                    </Typography>
          )}
        </Stack>
      </Stack>
    </div>
  );
}