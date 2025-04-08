"use client"; // Ensure this is at the top to mark as a Client Component
import * as React from "react";
import { DataSnapshot, ref, onValue, off, runTransaction, set, update } from "firebase/database";
import { db } from "./lib/firebase";
import { format, setHours } from "date-fns";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useNotifications } from "@toolpad/core";
import * as XLSX from "xlsx";
import debounce from "lodash/debounce"; // npm install lodash
import dynamic from "next/dynamic"; // Import dynamic for Next.js
import AddCircleOutline from "@mui/icons-material/AddCircleOutline"; // Icon for Create Job
import FileDownload from "@mui/icons-material/FileDownload"; // Icon for Export to Excel

const JobsTable = dynamic(() => Promise.resolve(React.memo(function JobsTableContent() {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [selectedJob, setSelectedJob] = React.useState<any>(null);
  const [openModifyDialog, setOpenModifyDialog] = React.useState(false);
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [openDateRangeDialog, setOpenDateRangeDialog] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [jobType, setJobType] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [dateTime, setDateTime] = React.useState("");
  const [status, setStatus] = React.useState("Assigned");
  const [hoursWorked, setHoursWorked] = React.useState("0");
  const [description, setDescription] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true); // Add loading state

  const mountedRef = React.useRef(false);
  const notifications = useNotifications();

  // Generate the next job ID with leading zeros
  const getNextJobId = async () => {
    const lastIdRef = ref(db, "lastJobId");
    return runTransaction(lastIdRef, (currentId) => {
      let nextId = 0;
      if (currentId === null) nextId = 0;
      else nextId = parseInt(currentId, 10) + 1;
      return nextId.toString().padStart(3, "0");
    })
      .then((result) => (result.committed ? result.snapshot.val() : Promise.reject(new Error("Transaction failed"))))
      .catch((error) => {
        console.error("Error generating next job ID:", error);
        throw error;
      });
  };

  React.useEffect(() => {
    mountedRef.current = true;

    const jobsRef = ref(db, "jobs");
    const employeesRef = ref(db, "employees");

    const handleJobsSnapshot = (snapshot: DataSnapshot) => {
      if (!mountedRef.current) return;
      const data = snapshot.val();
      const jobList = data
        ? Object.entries(data).map(([id, job]) => ({ id, ...(job as object) }))
        : [];
      if (mountedRef.current) {
        setJobs(jobList);
        if (isLoading) setIsLoading(false); // Set loading to false after first data load
      }
    };

    const handleEmployeesSnapshot = (snapshot: DataSnapshot) => {
      if (!mountedRef.current) return;
      const data = snapshot.val();
      const employeeList = data
        ? Object.entries(data).map(([id, employee]: [string, any]) => ({
            id,
            name: employee.name,
            phoneNumber: employee.phone,
            ...employee,
          }))
        : [];
      if (mountedRef.current) {
        setEmployees(employeeList);
        if (isLoading) setIsLoading(false); // Set loading to false after first data load
      }
    };

    onValue(jobsRef, handleJobsSnapshot);
    onValue(employeesRef, handleEmployeesSnapshot);

    return () => {
      mountedRef.current = false;
      off(jobsRef, "value", handleJobsSnapshot);
      off(employeesRef, "value", handleEmployeesSnapshot);
    };
  }, [isLoading]); // Dependency on isLoading to re-run if needed

  // Listen for export event from JobsPage
  React.useEffect(() => {
    const handleExport = () => {
      handleExportClick();
    };

    window.addEventListener("exportToExcel", handleExport);

    return () => {
      window.removeEventListener("exportToExcel", handleExport);
    };
  }, []);

  const formatPhoneNumber = (input: string) => {
    const numbers = input.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleCreateJob = () => {
    setOpenCreateDialog(true);
    setJobType("");
    setAssignedTo("");
    setAddress("");
    setPhoneNumber("");
    setDateTime("");
    setStatus("Assigned");
    setHoursWorked("0");
    setDescription("");
  };

  const validateCreateFields = () => {
    return jobType && assignedTo && address && phoneNumber && dateTime && description;
  };

  const handleSubmitJob = async () => {
    if (!validateCreateFields()) {
      notifications.show("All required fields must be filled out.", {
        severity: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    try {
      const newJobId = await getNextJobId();
      const jobRef = ref(db, `jobs/${newJobId}`);
      await set(jobRef, {
        id: newJobId,
        jobType,
        assignedTo,
        address,
        phoneNumber,
        dateTime,
        status,
        hoursWorked,
        description,
      });
      setOpenCreateDialog(false);
      notifications.show("Job created successfully!", {
        severity: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.warn("Job creation failed. Try again.");
      notifications.show("Job creation failed. Try again.", {
        severity: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleModify = (job: any) => {
    setSelectedJob(job);
    setJobType(job.jobType || "");
    setAssignedTo(job.assignedTo || "");
    setAddress(job.address || "");
    setPhoneNumber(job.phoneNumber || employees.find(emp => emp.name === job.assignedTo)?.phoneNumber || "");
    setDateTime(job.dateTime || "");
    setStatus(job.status || "Assigned");
    setHoursWorked(job.hoursWorked || "0");
    setDescription(job.description || "");
    setOpenModifyDialog(true);
  };

  const validateModifyFields = () => {
    return jobType && assignedTo && address && phoneNumber && dateTime && description;
  };

  const handleUpdateJob = async () => {
    if (!validateModifyFields()) {
      notifications.show("All required fields must be filled out.", {
        severity: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (!selectedJob) return;

    const jobRef = ref(db, `jobs/${selectedJob.id}`);
    try {
      await update(jobRef, {
        id: selectedJob.id,
        jobType,
        assignedTo,
        address,
        phoneNumber,
        dateTime,
        status,
        hoursWorked,
        description,
      });
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === selectedJob.id ? { ...job, jobType, assignedTo, address, phoneNumber, dateTime, status, hoursWorked, description } : job
        )
      );
      setOpenModifyDialog(false);
      notifications.show("Job updated successfully!", {
        severity: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.warn("Job update failed. Check your connection and try again.");
      notifications.show("Job update failed. Check your connection and try again.", {
        severity: "error",
        autoHideDuration: 3000,
      });
    }
  };

  const handleEmployeeSelect = (employeeName: string) => {
    setAssignedTo(employeeName);
    const selectedEmployee = employees.find(emp => emp.name === employeeName);
    setPhoneNumber(selectedEmployee?.phoneNumber || "");
  };

  const getStatusButtonStyle = (buttonStatus: string) => ({
    backgroundColor:
      status === buttonStatus
        ? "#333"
        : buttonStatus === "Assigned"
          ? "#BFC1CD"
          : buttonStatus === "Work in Progress"
            ? "#ff9800"
            : buttonStatus === "Completed"
              ? "#4caf50"
              : "#f44336",
    color: "#fff",
    fontWeight: status === buttonStatus ? "bold" : "normal",
    borderRadius: "2px",
    padding: "2px 6px",
    fontSize: "0.75rem",
  });

  const columns: GridColDef[] = React.useMemo(
    () => [
      { field: "id", headerName: "Job ID", flex: 1, minWidth: 150 },
      { field: "jobType", headerName: "Job Type", flex: 1, minWidth: 200 },
      { field: "assignedTo", headerName: "Assigned To", flex: 1, minWidth: 150 },
      { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
      {
        field: "dateTime",
        headerName: "Date",
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
          const date = new Date(params.value);
          return isNaN(date.getTime()) ? (
            <span>Invalid Date</span>
          ) : (
            <span>{format(date, "MMM dd, yyyy hh:mm a")}</span>
          );
        },
      },
      { field: "phoneNumber", headerName: "Phone Number", flex: 1, minWidth: 150 },
      {
        field: "description",
        headerName: "Description",
        flex: 1,
        minWidth: 250,
        renderCell: (params) => (
          <span style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
            {params.value || "No description"}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => {
          const statusValue = params.value as string;
          const [backgroundColor, textColor] =
            statusValue === "Assigned"
              ? ["#BFC1CD", "#fff"]
              : statusValue === "Work in Progress"
                ? ["#ff9800", "#fff"]
                : statusValue === "Completed"
                  ? ["#4caf50", "#fff"]
                  : statusValue === "Cancelled"
                    ? ["#f44336", "#fff"]
                    : ["#fff", "#000"];
          return (
            <span
              style={{
                backgroundColor,
                color: textColor,
                padding: "2px 15px",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.70rem",
              }}
            >
              {statusValue}
            </span>
          );
        },
      },
      { field: "hoursWorked", headerName: "Hours Worked", flex: 1, minWidth: 110 },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleModify(params.row)}
            sx={{ borderRadius: "2px", padding: "2px 6px", fontSize: "0.75rem", minWidth: "60px" }}
          >
            Modify
          </Button>
        ),
      },
    ],
    [status]
  );

  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) =>
      Object.values(job).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [jobs, searchQuery]);

  const debouncedSetSearchQuery = React.useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchQuery(e.target.value);
  };

  React.useEffect(() => {
    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery]);

  const exportToExcel = () => {
    const jobsToExport = filteredJobs.filter((job) => {
      const jobDate = new Date(job.dateTime);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) return jobDate >= start && jobDate <= end;
      else if (start) return jobDate >= start;
      else if (end) return jobDate <= end;
      return true;
    });

    if (jobsToExport.length === 0) {
      notifications.show("No data available for the selected date range.", {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    const data = jobsToExport.map((job) => ({
      "Job ID": job.id || "N/A",
      "Job Type": job.jobType || "N/A",
      "Assigned To": job.assignedTo || "N/A",
      "Address": job.address || "N/A",
      "Date": job.dateTime ? format(new Date(job.dateTime), "MMM dd, yyyy hh:mm a") : "Invalid Date",
      "Phone Number": job.phoneNumber || "N/A",
      "Description": job.description || "N/A",
      "Status": job.status || "N/A",
      "Hours Worked": job.hoursWorked || "0",
    }));

    console.log("Data prepared for Excel:", data);
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jobs_data_${format(new Date(), "yyyyMMdd")}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    notifications.show("Excel file exported successfully!", {
      severity: "success",
      autoHideDuration: 3000,
    });
    setOpenDateRangeDialog(false);
  };

  const handleExportClick = () => {
    setOpenDateRangeDialog(true);
    setStartDate("");
    setEndDate("");
  };

  if (isLoading) return <div>Loading...</div>; // Render loading state until data is ready

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateJob}
          startIcon={<AddCircleOutline />}
          sx={{ borderRadius: "4px", padding: "6px 12px" }}
        >
          Create a new job
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExportClick}
          startIcon={<FileDownload />}
          sx={{ borderRadius: "4px", padding: "6px 12px" }}
        >
          Export to Excel
        </Button>
      </Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search jobs..."
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          mb: 2,
          backgroundColor: "#1c1c1c",
          input: { color: "#fff" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
        }}
      />
      <DataGrid
        checkboxSelection
        rows={filteredJobs.slice(0,100)}
        columns={columns}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={(theme) => ({
          backgroundColor: "#1c1c1c",
          borderColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
          "& .MuiDataGrid-cell": { borderColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0", color: "#fff" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#2c2c2c", borderColor: "#333" },
          "& .MuiDataGrid-footerContainer": { color: "#fff", borderColor: "#333" },
        })}
        pageSizeOptions={[10,20,30]}
        disableColumnResize
        density="compact"
        getRowId={(row) => row.id}
      />
      {/* Modify Job Dialog */}
      <Dialog
        open={openModifyDialog}
        onClose={() => setOpenModifyDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#1a1a1a", color: "#fff" } }}
      >
        <DialogTitle sx={{ mb: 1, color: "#fff", fontSize: "1.25rem" }}>Modify Job</DialogTitle>
        <DialogContent sx={{ pt: 2, backgroundColor: "#1a1a1a", color: "#fff" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Assigned To <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                value={assignedTo}
                onChange={(e) => {
                  setAssignedTo(e.target.value as string);
                  const selectedEmployee = employees.find(emp => emp.name === e.target.value);
                  setPhoneNumber(selectedEmployee?.phoneNumber || "");
                }}
                variant="outlined"
                displayEmpty
                required
                sx={{
                  backgroundColor: "#2c2c2c",
                  ".MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                  "& .MuiSelect-select": { color: "#fff" },
                }}
              >
                <MenuItem value="" disabled>
                  Select Employee
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.name}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Date <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="datetime-local"
                value={dateTime || ""}
                onChange={(e) => setDateTime(e.target.value)}
                variant="outlined"
                required
                InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Address <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                variant="outlined"
                required
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Phone Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                variant="outlined"
                required
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Job Description <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                required
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
          <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Hours Worked
              </Typography>
              <TextField
                fullWidth
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                variant="outlined"
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
          </Box>
          <Typography sx={{ mt: 3, color: "#fff" }}>Job Status:</Typography>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
            <Button variant="contained" sx={getStatusButtonStyle("Assigned")} onClick={() => setStatus("Assigned")}>
              Assigned
            </Button>
            <Button
              variant="contained"
              sx={getStatusButtonStyle("Work in Progress")}
              onClick={() => setStatus("Work in Progress")}
            >
              Work in Progress
            </Button>
            <Button variant="contained" sx={getStatusButtonStyle("Completed")} onClick={() => setStatus("Completed")}>
              Completed
            </Button>
            <Button variant="contained" sx={getStatusButtonStyle("Cancelled")} onClick={() => setStatus("Cancelled")}>
              Cancelled
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#1a1a1a", justifyContent: "flex-end", p: 2 }}>
          <Button onClick={() => setOpenModifyDialog(false)} sx={{ color: "#ccc", mr: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateJob}
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              "&:hover": { backgroundColor: "#b71c1c" },
              borderRadius: 4,
              px: 2,
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      {/* Create Job Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#1a1a1a", color: "#fff" } }}
      >
        <DialogTitle sx={{ mb: 1, color: "#fff", fontSize: "1.25rem" }}>Create Job</DialogTitle>
        <DialogContent sx={{ pt: 2, backgroundColor: "#1a1a1a", color: "#fff" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>
            <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Job Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                variant="outlined"
                required
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Assigned To <span style={{ color: "red" }}>*</span>
              </Typography>
              <Select
                fullWidth
                value={assignedTo}
                onChange={(e) => {
                  setAssignedTo(e.target.value as string);
                  const selectedEmployee = employees.find(emp => emp.name === e.target.value);
                  setPhoneNumber(selectedEmployee?.phoneNumber || "");
                }}
                variant="outlined"
                displayEmpty
                required
                sx={{
                  backgroundColor: "#2c2c2c",
                  ".MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                  "& .MuiSelect-select": { color: "#fff" },
                }}
              >
                <MenuItem value="" disabled>
                  Select Employee
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.name}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Address <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                variant="outlined"
                required
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Date <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="datetime-local"
                value={dateTime || ""}
                onChange={(e) => setDateTime(e.target.value)}
                variant="outlined"
                required
                InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
            <Box>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Phone Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                variant="outlined"
                required
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ mb: 1, color: "#fff" }}>
                Job Description <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                required
                InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
              />
            </Box>
          </Box>
          <Typography sx={{ mt: 3, color: "#fff" }}>Job Status:</Typography>
          <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
            <Button variant="contained" sx={getStatusButtonStyle("Assigned")} onClick={() => setStatus("Assigned")}>
              Assigned
            </Button>
            <Button
              variant="contained"
              sx={getStatusButtonStyle("Work in Progress")}
              onClick={() => setStatus("Work in Progress")}
            >
              Work in Progress
            </Button>
            <Button variant="contained" sx={getStatusButtonStyle("Completed")} onClick={() => setStatus("Completed")}>
              Completed
            </Button>
            <Button variant="contained" sx={getStatusButtonStyle("Cancelled")} onClick={() => setStatus("Cancelled")}>
              Cancelled
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#1a1a1a", justifyContent: "flex-end", p: 2 }}>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ color: "#ccc", mr: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitJob}
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              "&:hover": { backgroundColor: "#b71c1c" },
              borderRadius: 4,
              px: 2,
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Date Range Dialog */}
      <Dialog
        open={openDateRangeDialog}
        onClose={() => setOpenDateRangeDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#1a1a1a", color: "#fff" } }}
      >
        <DialogTitle sx={{ mb: 2, color: "#fff", fontSize: "1.25rem" }}>Select Date Range</DialogTitle>
        <DialogContent sx={{ pt: 2, backgroundColor: "#1a1a1a", color: "#fff" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
              InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
              sx={{ mb: 2, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
              InputProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#555" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#1a1a1a", justifyContent: "flex-end", p: 2 }}>
          <Button onClick={() => setOpenDateRangeDialog(false)} sx={{ color: "#ccc", mr: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={exportToExcel}
            sx={{
              backgroundColor: "#d32f2f",
              color: "#fff",
              "&:hover": { backgroundColor: "#b71c1c" },
              borderRadius: 4,
              px: 2,
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
})), { ssr: false }); // Disable SSR for this component

export default JobsTable;