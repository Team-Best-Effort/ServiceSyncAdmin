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

export default function JobsPerDayChart() {
  const theme = useTheme();
  const [jobsPerDay, setJobsPerDay] = useState<{ name: string; value: number }[]>([]);
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
      
      // Get the current date and calculate the last 30 days
      const today = new Date();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      const dailyJobCounts: { [date: string]: number } = last30Days.reduce((acc: { [date: string]: number }, date) => {
        acc[date] = 0;
        return acc;
      }, {});

      // Count jobs by the createdAt date
      jobList.forEach((job: any) => {
        const jobDate = new Date(job.dateTime); // Use dateTime field
        const formattedDate = `${jobDate.getMonth() + 1}/${jobDate.getDate()}`;
        if (dailyJobCounts.hasOwnProperty(formattedDate)) {
          dailyJobCounts[formattedDate] += 1;
        }
      });

      // Format the data for the LineChart
      const formattedData = last30Days.map((date) => ({
        name: date,
        value: dailyJobCounts[date] || 0,
      }));

      setJobsPerDay(formattedData);
      setLoading(false); // Data is now loaded
    };

    onValue(jobsRef, handleJobsSnapshot, (error) => {
      setLoading(false);
      setError('Error loading job data');
    });

    return () => off(jobsRef, 'value', handleJobsSnapshot);
  }, []);

  const calculateGrowthComparedToMonth = () => {
    if (jobsPerDay.length < 2) return 0; // If there's not enough data, return 0% change

    const totalJobs = jobsPerDay.reduce((acc, item) => acc + item.value, 0);
    const averageJobsPerDay = totalJobs / jobsPerDay.length;

    const lastDayJobs = jobsPerDay[0].value;

    const growth = ((lastDayJobs - averageJobsPerDay) / averageJobsPerDay) * 100;
    return growth;
  };

  const colorPalette = [
    theme.palette.primary.light,
    theme.palette.primary.main,
    theme.palette.primary.dark,
  ];

  const growthPercentage = calculateGrowthComparedToMonth();

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Jobs Per Day (Last 30 Days)
        </Typography>
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
              {jobsPerDay.reduce((acc, item) => acc + item.value, 0)} {/* Sum of all jobs */}
            </Typography>
            <Chip
              size="small"
              color={growthPercentage >= 0 ? 'success' : 'error'}
              label={`${growthPercentage.toFixed(1)}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Jobs per day for the last 30 days
          </Typography>
        </Stack>
        <LineChart
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'point',
              data: jobsPerDay.map((item) => item.name),
              tickInterval: (index, i) => (i + 1) % 5 === 0,
            },
          ]}
          series={[
            {
              id: 'jobs',
              label: 'Jobs',
              showMark: false,
              curve: 'linear',
              stack: 'total',
              area: true,
              stackOrder: 'ascending',
              data: jobsPerDay.map((item) => item.value),
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
