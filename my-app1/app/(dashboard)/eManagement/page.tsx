"use client";
import * as React from "react";
import { getDatabase, ref, onValue, set, update, remove, get } from "firebase/database"; // Added 'get' for uniqueness check
import { db, diff_name_for_auth } from "../editProfile/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

// Function to generate a custom employee ID (2 letters + 3 numbers)
const generateEmployeeId = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let id = "";
  // Generate 2 random uppercase letters
  for (let i = 0; i < 2; i++) {
    id += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  // Generate 3 random numbers
  for (let i = 0; i < 3; i++) {
    id += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return id;
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState(""); // New state for password

  // Fetch employees from Firebase in real-time
  React.useEffect(() => {
    const employeesRef = ref(db, "employees");
    onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const employeeList = Object.entries(data).map(([id, employee]) => ({
          id,
          ...(employee as object),
        }));
        setEmployees(employeeList);
      } else {
        setEmployees([]);
      }
    });
  }, []);

  // Open Create Employee Dialog
  const handleCreateEmployee = () => {
    setOpenCreateDialog(true);
    setName("");
    setEmail("");
    setPhone("");
    setPassword(""); // Reset password
  };

    // Submit New Employee with custom ID and password
    const handleSubmitEmployee = async () => {
      if (!name || !email || !phone || !password) return;
      try {
        const userCredential = await createUserWithEmailAndPassword(diff_name_for_auth, email, password);
        const user = userCredential.user;
        console.log('*********Read********: Success adding a new user');
        // Any further actions after success can go here
        let newEmployeeId;
        let exists = true;
        while (exists) {
          newEmployeeId = generateEmployeeId();
          const checkRef = ref(db, `employees/${newEmployeeId}`);
          const snapshot = await get(checkRef);
          exists = snapshot.exists();
        }
        const newEmployeeRef = ref(db, `employees/${newEmployeeId}`);
        const newEmployee = { name, email, phone, password }; // Include password in Firebase
        try {
          await set(newEmployeeRef, newEmployee);
          setOpenCreateDialog(false);
        } catch (error) {
          console.warn("Could not add employee. Please try again.");
        }
      } catch (error: unknown) {
        const errorMessage = (error as Error).message; // Cast to Error type
        console.error('******Read******', errorMessage);
        // Any further actions after error can go here
      }
  
    };
  

  // Open Edit Employee Dialog
  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setName(employee.name);
    setEmail(employee.email);
    setPhone(employee.phone);
    setPassword(employee.password || ""); // Set password from Firebase, or empty if none
    setOpenEditDialog(true);
  };

  // Update Employee in Firebase
  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    const employeeRef = ref(db, `employees/${selectedEmployee.id}`);
    try {
      
      await update(employeeRef, { name, email, phone });
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === selectedEmployee.id ? { ...emp, name, email, phone } : emp
        )
      );
      setOpenEditDialog(false);
    } catch (error) {
      console.warn("Update failed. Ensure the data is valid and try again.");
    }
  };

  // Delete Employee from Firebase
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    const employeeRef = ref(db, `employees/${id}`);
    try {
      await remove(employeeRef);
      setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
    } catch (error) {
      console.warn("Failed to delete employee. Verify if the entry exists.");
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "Employee ID", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Phone", width: 150 },
    {
      field: "password",
      headerName: "Password",
      width: 120, // Smaller width for password column
      renderCell: (params) => "*****", // Hide password with asterisks
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleEdit(params.row)}
            sx={{
              borderRadius: "2px",
              padding: "2px 6px",
              fontSize: "0.75rem",
              minWidth: "60px",
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(params.row.id)}
            sx={{
              borderRadius: "2px",
              padding: "2px 6px",
              fontSize: "0.75rem",
              minWidth: "60px",
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateEmployee}
        sx={{ mb: 2, borderRadius: "2px", padding: "2px 6px", fontSize: "0.75rem", minWidth: "120px" }}
      >
        Add New Employee
      </Button>

      <DataGrid
        rows={employees}
        columns={columns}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
        initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        sx={(theme) => ({
          backgroundColor: "#1c1c1c",
          borderColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
          "& .MuiDataGrid-cell": {
            borderColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
            color: "#fff",
            padding: "4px",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#2c2c2c",
            borderColor: "#333",
            padding: "4px",
          },
          "& .MuiDataGrid-footerContainer": {
            color: "#fff",
            borderColor: "#333",
          },
          "& .MuiCheckbox-root": {},
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          tableLayout: "fixed",
        })}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
        autoHeight

      />

      {/* Create Employee Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
      >
        <DialogTitle sx={{ mb: "10px", color: "#fff" }}>Add New Employee</DialogTitle>
        <DialogContent sx={{ minHeight: "300px", pt: "10px", backgroundColor: "#2c2c2c", color: "#fff" }}>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Password"
              type="password" // Masks input as dots for security
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#2c2c2c", color: "#fff" }}>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ color: "#fff" }}>
            Cancel
          </Button>
          <Button onClick={handleSubmitEmployee} sx={{ color: "#fff" }}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#2c2c2c", color: "#fff" } }}
      >
        <DialogTitle sx={{ mb: "10px", color: "#fff" }}>Edit Employee</DialogTitle>
        <DialogContent sx={{ minHeight: "300px", pt: "10px", backgroundColor: "#2c2c2c", color: "#fff" }}>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
          <Box sx={{ mt: "15px" }}>
            <TextField
              fullWidth
              label="Password"
              type="password" // Masks input as dots for security
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{ style: { color: "#fff", backgroundColor: "#1c1c1c" } }}
              InputLabelProps={{ style: { color: "#fff" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#2c2c2c", color: "#fff" }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ color: "#fff" }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateEmployee} sx={{ color: "#fff" }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}