"use client"; // Ensures this is a Client Component
//testing
import * as React from "react";
import Typography from "@mui/material/Typography";
import JobsTable from "./JobsTable";
import CreateJobDialog from "./CreateJobDialog";
import Button from "@mui/material/Button";
import Loader from "../Loader";
import theme from "@/theme";

export default function JobsPage() {
  // State to control the Create Job Dialog
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Display loader while loading
  if (isLoading) {
    return <Loader size={60} color={theme.palette.primary.main} />; // Use theme primary color for loader
  }
  // Function to open the dialog
  const handleOpen = () => setOpen(true);

  // Function to close the dialog
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Page Header */}
   


      {/* Jobs Table */}
      <JobsTable />

      
      {/* Create Job Dialog */}
      <CreateJobDialog open={open} onClose={handleClose} />
    </>
  );
}
