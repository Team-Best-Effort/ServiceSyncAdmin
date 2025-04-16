"use client";

import * as React from "react";
import Typography from "@mui/material/Typography";
import Loader from "./Loader"; // Ensure this path is correct
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import { useRouter } from "next/navigation";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useTheme } from "@mui/material/styles";
import { AdminPanelSettingsRounded, EditCalendarRounded, ReceiptLongRounded, WorkHistoryOutlined } from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import { useSession } from "next-auth/react";
import JobStatusPieChart from "../components/JobStatusPieChart";
import EmployeeGrowthChart from "../components/JobsPerDayChart";
import JobsPerDayChart from "../components/JobsPerDayChart";
import { UpcomingEvents } from "../components/UpcomingEvents";
import EmployeeJobsPerDay from "../components/EmployeeJobsPerDay";

export default function HomePage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const router = useRouter();
  const theme = useTheme(); // Access the current theme
  const { data: session } = useSession();

  // Hardcoded user data for testing
  const user = {
    name: session?.user?.name,
    role: session?.user?.id, // Example role/status
    avatar: session?.user?.image, // Placeholder image URL for avatar
  };

  // Simulate loading delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Display loader while loading
  if (isLoading) {
    return <Loader size={60} color={theme.palette.primary.main} />; // Use theme primary color for loader
  }

  return (
    <Box sx={{ flexGrow: 1, p: 4, bgcolor: "background.default" }}>
      {/* Welcome Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 6,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Avatar
          src={user.avatar || "Reload to show name"}
          alt={user.name || "Reload to show name"}
          sx={{ width: 60, height: 60 }}
        />
        <Box>
          <Typography
            variant="h5"
            component="div"
            sx={{ color: "text.primary", fontWeight: "bold" }}
          >
            Welcome, {user.name}!
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 0.5 }}>
            {user.role} | Roroman Plumbing
          </Typography>
        </Box>
      </Box>

      {/* Dashboard Grid (2x2) */}
      <Grid container spacing={3}>
        {/* Job Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, boxShadow: 2, minHeight: '400px' }}>
            <JobStatusPieChart />
          </Card>
        </Grid>

        {/* Jobs Per Day Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, boxShadow: 2, minHeight: '400px' }}>
            <JobsPerDayChart />
          </Card>
        </Grid>

        {/* Employee Jobs Per Day */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, boxShadow: 2, minHeight: '400px' }}>
            <EmployeeJobsPerDay />
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, boxShadow: 2, minHeight: '400px' }}>
            <UpcomingEvents />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}