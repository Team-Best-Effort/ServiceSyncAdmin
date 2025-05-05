"use client";

import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { ref, get } from "firebase/database"; 
import { db } from "../editProfile/lib/firebase"; 

export default function ServiceStatusPage() {
  const [appStatus, setAppStatus] = React.useState<"online" | "offline">("online"); 
  const [calendarDBStatus, setCalendarDBStatus] = React.useState<"online" | "offline" | null>(null);
  const [jobsDBStatus, setJobsDBStatus] = React.useState<"online" | "offline" | null>(null);
  const theme = useTheme();

  // Check calendar and jobs DB statuses on mount
  React.useEffect(() => {
    const checkServices = async () => {
      try {
        // 1. Calendar DB connectivity (using Firebase Realtime Database)
        const calendarDBRef = ref(db, "ServiceSync");
        const calendarSnapshot = await get(calendarDBRef);
        setCalendarDBStatus(calendarSnapshot.exists() ? "online" : "offline");
        console.log(`Calendar DB Status: ${calendarDBStatus}`);

        // 2. Jobs DB connectivity (using Firebase Realtime Database)
        const jobsDBRef = ref(db, "jobs");
        const jobsSnapshot = await get(jobsDBRef);
        setJobsDBStatus(jobsSnapshot.exists() ? "online" : "offline");
        console.log(`Jobs DB Status: ${jobsDBStatus}`);
      } catch (error) {
        console.warn("Database check failed. Some services may be offline. Error details:", error);
        setCalendarDBStatus("offline");
        setJobsDBStatus("offline");
      }
    };

    checkServices();
  }, [calendarDBStatus, jobsDBStatus]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: "background.default" }}>

        <Grid container spacing={4} justifyContent="center">
          {/* App/Auth Status Card (Always Online) */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                height: 300, // Fixed height for all cards
                width: "100%", // Ensure consistent width
                bgcolor:
                  appStatus === "online"
                    ? theme.palette.success.light
                    : theme.palette.error.light,
                borderRadius: 2,
                boxShadow: 1,
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 60,
                    color: "#2e7d32", // Deeper green for "Online" icon
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: "medium",
                    color: "#FFFFFF", // White text for card content
                  }}
                >
                  {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#FFFFFF", mt: 1 }} // White text for description
                >
                  Authentication service is running normally.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Calendar DB Status Card */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                height: 300, // Fixed height for all cards
                width: "100%", // Ensure consistent width
                bgcolor:
                  calendarDBStatus === "online"
                    ? theme.palette.success.light
                    : theme.palette.error.light,
                borderRadius: 2,
                boxShadow: 1,
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                {calendarDBStatus === "online" ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 60,
                      color: "#2e7d32", // Deeper green for "Online" icon
                      mb: 2,
                    }}
                  />
                ) : (
                  <ErrorIcon
                    sx={{
                      fontSize: 60,
                      color: theme.palette.error.main,
                      mb: 2,
                    }}
                  />
                )}
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: "medium",
                    color: "#FFFFFF", // White text for card content
                  }}
                >
                  {calendarDBStatus
                    ? calendarDBStatus.charAt(0).toUpperCase() + calendarDBStatus.slice(1)
                    : "Checking..."}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#FFFFFF", mt: 1 }} // White text for description
                >
                  {calendarDBStatus === "online"
                    ? "Calendar database is running normally."
                    : calendarDBStatus === "offline"
                      ? "Calendar database is unavailable."
                      : "Please wait while we check the status..."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Jobs DB Status Card */}
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                height: 300, // Fixed height for all cards
                width: "100%", // Ensure consistent width
                bgcolor:
                  jobsDBStatus === "online"
                    ? theme.palette.success.light
                    : theme.palette.error.light,
                borderRadius: 2,
                boxShadow: 1,
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <CardContent sx={{ textAlign: "center", p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                {jobsDBStatus === "online" ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 60,
                      color: "#2e7d32", // Deeper green for "Online" icon
                      mb: 2,
                    }}
                  />
                ) : (
                  <ErrorIcon
                    sx={{
                      fontSize: 60,
                      color: theme.palette.error.main,
                      mb: 2,
                    }}
                  />
                )}
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: "medium",
                    color: "#FFFFFF", // White text for card content
                  }}
                >
                  {jobsDBStatus
                    ? jobsDBStatus.charAt(0).toUpperCase() + jobsDBStatus.slice(1)
                    : "Checking..."}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#FFFFFF", mt: 1 }} // White text for description
                >
                  {jobsDBStatus === "online"
                    ? "Jobs database is running normally."
                    : jobsDBStatus === "offline"
                      ? "Jobs database is unavailable."
                      : "Please wait while we check the status..."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}