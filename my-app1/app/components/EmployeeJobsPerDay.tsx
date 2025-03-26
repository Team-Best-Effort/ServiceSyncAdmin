'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../(dashboard)/jobs/lib/firebase';
import { MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

export default function EmployeeJobsPerDayChart() {
  const theme = useTheme();
  const [employeeJobsPerDay, setEmployeeJobsPerDay] = useState<{ name: string; value: number }[]>([]);
  const [employees, setEmployees] = useState<string[]>([]); // To store employee names
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state
  
  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    
    const handleJobsSnapshot = (snapshot: { val: () => any }) => {
      const data = snapshot.val();
      
      // Check if data is empty or not in the expected format
      if (!data) {
        setLoading(false);
        setError('No job data available.');
        return;
      }

      const jobList = Object.values(data);

      // Get the current date and calculate the last 28 days
      const today = new Date();
      const last28Days = Array.from({ length: 28 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      const dailyJobCounts: { [date: string]: number } = last28Days.reduce((acc: { [date: string]: number }, date) => {
        acc[date] = 0;
        return acc;
      }, {});

      const employeeJobCounts: { [employeeName: string]: { [date: string]: number } } = {};

      // Count jobs by employee and date
      jobList.forEach((job: any) => {
        const jobDate = new Date(job.dateTime); //
        const formattedDate = `${jobDate.getMonth() + 1}/${jobDate.getDate()}`;
        const employeeName = job.assignedTo; 

        if (dailyJobCounts.hasOwnProperty(formattedDate)) {
          if (!employeeJobCounts[employeeName]) {
            employeeJobCounts[employeeName] = { [formattedDate]: 1 };
          } else {
            employeeJobCounts[employeeName][formattedDate] = (employeeJobCounts[employeeName][formattedDate] || 0) + 1;
          }
        }
      });

      setEmployees(Object.keys(employeeJobCounts));

      if (selectedEmployee) {
        const formattedData = last28Days.map((date) => ({
          name: date,
          value: employeeJobCounts[selectedEmployee]?.[date] || 0,
        }));

        setEmployeeJobsPerDay(formattedData);
      }

      setLoading(false);
    };

    onValue(jobsRef, handleJobsSnapshot, (error) => {
      setLoading(false);
      setError('Error loading job data');
    });

    return () => off(jobsRef, 'value', handleJobsSnapshot);
  }, [selectedEmployee]);

  const handleEmployeeChange = (event: SelectChangeEvent<string>) => {
    const employeeName = event.target.value;
    setSelectedEmployee(employeeName);
  };

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        
        {/* Dropdown for selecting employee */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Employee</InputLabel>
          <Select
            value={selectedEmployee}
            label="Employee"
            onChange={handleEmployeeChange}
          >
            {employees.map((employee) => (
              <MenuItem key={employee} value={employee}>
                {employee}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {employeeJobsPerDay.reduce((acc, item) => acc + item.value, 0)} {/* Sum of all jobs */}
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Jobs per day for the last 28 days
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[{
            scaleType: 'point',
            data: employeeJobsPerDay.map((item) => item.name),
            tickInterval: (index, i) => (i + 1) % 5 === 0,
          }]}
          series={[
            {
              id: 'jobs',
              label: 'Jobs',
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: employeeJobsPerDay.map((item) => item.value),
            },
          ]}
          height={250}
          margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-jobs': {
              fill: "url('#jobs')",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.main} id="jobs" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
