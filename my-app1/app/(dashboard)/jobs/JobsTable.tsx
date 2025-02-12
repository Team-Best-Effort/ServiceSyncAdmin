// JobsTable.tsx
"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
export default function JobsTable() {
const columns: GridColDef[] = [
  { field: 'id', headerName: 'Job ID', width: 90 },
  {
    field: 'jobtype',
    headerName: 'Job Type',
    width: 180,
    editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Assigned to',
    width: 250,
    editable: true,
  },
  {
    field: 'address',
    headerName: 'Address',
    width: 380,
    editable: true,
  },
  {
    field: 'status',
    headerName: 'Status',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 200,
  },
];



const rows = [
  { id: 1, lastName: 'Snow', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
  { id: 2, lastName: 'Lannister', jobtype: 'Plumbing', address: "31st street", status: 'Active' },
  { id: 3, lastName: 'Lannister', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
  { id: 4, lastName: 'Stark', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
  { id: 5, lastName: 'Targaryen', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
  { id: 6, lastName: 'Melisandre', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
  { id: 7, lastName: 'Clifford', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
  { id: 8, lastName: 'Frances', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
  { id: 9, lastName: 'Roxie', jobtype: 'Plumbing', address: "14th st", status: 'Active' },
];


  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          '& > *': {
            m: 0.5,
          },
        }}
      >
       
      </Box>
    </Box>
  );
}