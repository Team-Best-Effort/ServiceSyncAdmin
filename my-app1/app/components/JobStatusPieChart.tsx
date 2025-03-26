'use client';
import * as React from 'react';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { PieChart } from '@mui/x-charts/PieChart';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../(dashboard)/jobs/lib/firebase';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

interface Job {
  status: string;
}

interface StatusData {
  name: string;
  value: number;
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'primary' | 'secondary'; smaller?: boolean }>(({ theme, smaller }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: smaller ? theme.palette.text.secondary : theme.palette.primary.main, // Apply theme color to primary text
  fontSize: smaller ? theme.typography.body2.fontSize : theme.typography.h6.fontSize, // Use smaller font size for the primary text
  fontWeight: smaller ? theme.typography.body2.fontWeight : theme.typography.h5.fontWeight,
}));

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

const JobStatusPieChart = () => {
  const [statusData, setStatusData] = React.useState<StatusData[]>([]);

  React.useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    
    const handleJobsSnapshot = (snapshot: { val: () => any; }) => {
      const data = snapshot.val();
      const jobList: Job[] = data ? Object.values(data) : [];
      
      const statusCounts = jobList.reduce((acc: { [key: string]: number }, job: Job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});
      
      const formattedData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
      }));
      
      setStatusData(formattedData);
    };

    onValue(jobsRef, handleJobsSnapshot);

    return () => off(jobsRef, 'value', handleJobsSnapshot);
  }, []);

  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '2x', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Job Status Distribution
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
          <PieChart
            series={[{ data: statusData, innerRadius: 100, outerRadius: 70, paddingAngle: 2, cornerRadius: 5 }]}
            colors={COLORS}
            margin={{
              left: 80,
              right: 80,
              top: 80,
              bottom: 80,
            }}
            height={260} 
            width={360}  
          >
            <PieCenterLabel primaryText="Total Jobs" secondaryText={`${statusData.reduce((acc, item) => acc + item.value, 0)}`} />
          </PieChart>
        </Box>
        
        <Stack direction="row" sx={{ justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
          {statusData.map((status, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: '500', color: COLORS[index % COLORS.length] }}>
                {status.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {status.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JobStatusPieChart;
