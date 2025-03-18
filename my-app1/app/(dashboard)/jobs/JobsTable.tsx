"use client";
import * as React from "react";
import { DataSnapshot, ref, onValue, update, push, off } from "firebase/database";
import { db } from "./lib/firebase";
import { format } from "date-fns";
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

export default function JobsTable() {
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [employees, setEmployees] = React.useState<any[]>([]); // New state for employees
  const [selectedJob, setSelectedJob] = React.useState<any>(null);
  const [openModifyDialog, setOpenModifyDialog] = React.useState(false);
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);

  const [jobType, setJobType] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [dateTime, setDateTime] = React.useState("");
  const [status, setStatus] = React.useState("Assigned");

  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;

    const jobsRef = ref(db, "jobs");
    const employeesRef = ref(db, "employees");

    const handleJobsSnapshot = (snapshot: DataSnapshot) => {
      if (!mountedRef.current) return;
      const data = snapshot.val();
      if (data) {
        const jobList = Object.entries(data).map(([id, job]) => ({
          id,
          ...(job as object),
        }));
        // Delay the state update to ensure mounting is complete.
        setTimeout(() => {
          if (mountedRef.current) {
            setJobs(jobList);
          }
        }, 0);
      } else {
        setTimeout(() => {
          if (mountedRef.current) {
            setJobs([]);
          }
        }, 0);
      }
    };

    const handleEmployeesSnapshot = (snapshot: DataSnapshot) => {
      if (!mountedRef.current) return;
      const data = snapshot.val();
      if (data) {
        const employeeList = Object.entries(data).map(
          ([id, employee]: [string, any]) => ({
            id,
            name: employee.name,
            phoneNumber: employee.phone,
            ...employee,
          })
        );
        setTimeout(() => {
          if (mountedRef.current) {
            setEmployees(employeeList);
          }
        }, 0);
      } else {
        setTimeout(() => {
          if (mountedRef.current) {
            setEmployees([]);
          }
        }, 0);
      }
    };

    onValue(jobsRef, handleJobsSnapshot);
    onValue(employeesRef, handleEmployeesSnapshot);

    return () => {
      mountedRef.current = false;
      off(jobsRef, "value", handleJobsSnapshot);
      off(employeesRef, "value", handleEmployeesSnapshot);
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
  };

  const handleSubmitJob = async () => {
    if (!jobType || !assignedTo || !address || !phoneNumber || !dateTime) return;

    const newJobRef = push(ref(db, "jobs"));
    const newJob = { jobType, assignedTo, address, phoneNumber, dateTime, status };

    try {
      await update(newJobRef, newJob);
      setOpenCreateDialog(false);
    } catch (error) {
      console.warn("Job creation failed. Try again.");
    }
  };

  const handleModify = (job: any) => {
    setSelectedJob(job);
    setJobType(job.jobType);
    setAssignedTo(job.assignedTo);
    setAddress(job.address);
    setPhoneNumber(job.phoneNumber || employees.find(emp => emp.name === job.assignedTo)?.phoneNumber || "");
    setDateTime(job.dateTime);
    setStatus(job.status);
    setOpenModifyDialog(true);
  };

  const handleUpdateJob = async () => {
    if (!selectedJob) return;

    const jobRef = ref(db, `jobs/${selectedJob.id}`);
    try {
      await update(jobRef, { jobType, assignedTo, address, phoneNumber, dateTime, status });
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === selectedJob.id
            ? { ...job, jobType, assignedTo, address, phoneNumber, dateTime, status }
            : job
        )
      );
      setOpenModifyDialog(false);
    } catch (error) {
      console.warn("Job update failed. Check your connection and try again.");
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

  const columns: GridColDef[] = [
    { field: "id", headerName: "Job ID", width: 150 },
    { field: "jobType", headerName: "Job Type", width: 200 },
    { field: "assignedTo", headerName: "Assigned To", width: 150 },
    { field: "address", headerName: "Address", width: 200 },
    {
      field: "dateTime",
      headerName: "Date",
      width: 200,
      renderCell: (params) => {
        const dateValue = params.value;
        const date = new Date(dateValue);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return <span>Invalid Date</span>;
        }
        const formattedDate = format(date, "MMM dd, yyyy, h:mm a");
        return <span>{formattedDate}</span>;
      },
    },
    
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const statusValue = params.value as string;
        let backgroundColor, textColor;
        switch (statusValue) {
          case "Assigned":
            backgroundColor = "#BFC1CD";
            textColor = "#fff";
            break;
          case "Work in Progress":
            backgroundColor = "#ff9800";
            textColor = "#fff";
            break;
          case "Completed":
            backgroundColor = "#4caf50";
            textColor = "#fff";
            break;
          case "Cancelled":
            backgroundColor = "#f44336";
            textColor = "#fff";
            break;
          default:
            backgroundColor = "#fff";
            textColor = "#000";
        }
        const statusStyle = {
          backgroundColor,
          color: textColor,
          padding: "2px 15px",
          borderRadius: "2px",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          fontWeight: "bold",
          fontSize: "0.70rem",
        };
        return <span style={statusStyle}>{statusValue}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
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
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Button variant="contained" color="primary" onClick={handleCreateJob} sx={{ mb: 2 }}>
        Create a new job
      </Button>

      <DataGrid
        checkboxSelection
        rows={jobs}
        columns={columns}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
        initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        sx={(theme) => ({
          backgroundColor: "#1c1c1c",
          borderColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
          "& .MuiDataGrid-cell": { borderColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0", color: "#fff" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#2c2c2c", borderColor: "#333" },
          "& .MuiDataGrid-footerContainer": { color: "#fff", borderColor: "#333" },
        })}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
      />

      {/* Modify Job Dialog */}
      <Dialog
        open={openModifyDialog}
        onClose={() => setOpenModifyDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
      >
        <DialogTitle sx={{ mb: "2px", color: "#fff" }}>Modify Job</DialogTitle>
        <DialogContent sx={{ minHeight: "420px", pt: "10px", backgroundColor: "#2c2c2c", color: "#fff" }}>

          <Box sx={{ mt: "30px" }}>
            <Select
              fullWidth
              value={assignedTo}
              onChange={(e) => {
                setAssignedTo(e.target.value);
                const selectedEmployee = employees.find(emp => emp.name === e.target.value);
                setPhoneNumber(selectedEmployee?.phoneNumber || ""); // Auto-fill phone number
              }}
              variant="outlined"
              displayEmpty
              sx={{ color: "#fff", backgroundColor: "#1c1c1c", ".MuiOutlinedInput-notchedOutline": { borderColor: "#fff" } }}
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
          <Box sx={{ mt: "30px" }}>
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Date"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" }, shrink: true}}
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
            />
          </Box>
          <Box sx={{ mt: "30px" }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>

          <Typography sx={{ mt: "30px", color: "#fff" }}>Job Status:</Typography>
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
        <DialogActions sx={{ backgroundColor: "#2c2c2c", color: "#fff" }}>
          <Button onClick={() => setOpenModifyDialog(false)} sx={{ color: "#fff" }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateJob} sx={{ color: "#fff" }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Job Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
      >
        <DialogTitle sx={{ mb: "10px", color: "#fff" }}>Create Job</DialogTitle>
        <DialogContent sx={{ minHeight: "420px", pt: "10px", backgroundColor: "#2c2c2c", color: "#fff" }}>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Job Type"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <Select
              fullWidth
              value={assignedTo}
              onChange={(e) => {
                setAssignedTo(e.target.value);
                const selectedEmployee = employees.find(emp => emp.name === e.target.value);
                setPhoneNumber(selectedEmployee?.phoneNumber || ""); // Auto-fill phone number
              }}
              variant="outlined"
              displayEmpty
              sx={{ color: "#fff", backgroundColor: "#1c1c1c", ".MuiOutlinedInput-notchedOutline": { borderColor: "#fff" } }}
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
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Date"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" }, shrink: true}}
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>

          <Typography sx={{ mt: "15px", color: "#fff" }}>Job Status:</Typography>
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
        <DialogActions sx={{ backgroundColor: "#2c2c2c", color: "#fff" }}>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ color: "#fff" }}>
            Cancel
          </Button>
          <Button onClick={handleSubmitJob} sx={{ color: "#fff" }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}