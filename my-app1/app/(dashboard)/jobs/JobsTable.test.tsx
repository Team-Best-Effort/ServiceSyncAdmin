import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import JobsTable from "./JobsTable";
import { vi } from "vitest";

// Dummy Data
const dummyJobs = {
  "001": {
    id: "001",
    jobType: "Cleaning",
    assignedTo: "Alice",
    address: "123 Main St",
    dateTime: new Date().toISOString(),
    phoneNumber: "1234567890",
    description: "Test job completed",
    status: "Completed"
  },
  "002": {
    id: "002",
    jobType: "Delivery",
    assignedTo: "Bob",
    address: "456 Market St",
    dateTime: new Date().toISOString(),
    phoneNumber: "2345678901",
    description: "Test job assigned",
    status: "Assigned"
  }
};

const dummyEmployees = {
  emp1: { id: "emp1", name: "Alice", phone: "1234567890" },
  emp2: { id: "emp2", name: "Bob", phone: "2345678901" }
};

// ✅ Corrected Firebase Mock
vi.mock("firebase/database", async () => {
  return {
    ref: (_db: any, path: string) => ({ path }),
    onValue: (ref: { path: string }, callback: (snapshot: { val: () => any }) => void) => {
      let data;
      if (ref.path === "jobs") {
        data = dummyJobs;
      } else if (ref.path === "employees") {
        data = dummyEmployees;
      }
      callback({ val: () => data });
      return () => {};
    },
    off: vi.fn(),
    runTransaction: vi.fn(() =>
      Promise.resolve({
        committed: true,
        snapshot: { val: () => "003" }
      })
    ),
    set: vi.fn(() => Promise.resolve()),
    update: vi.fn(() => Promise.resolve()),
    getDatabase: vi.fn(() => ({})), // ✅ Now properly registered
  };
});

// ✅ Mock toolpad/core if used
vi.mock("@toolpad/core", () => ({
  useNotifications: () => ({
    show: vi.fn()
  })
}));

describe("JobsTable Component", () => {
  it("renders dummy jobs and displays the completed status correctly", async () => {
    render(<JobsTable />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Content expectations
    expect(screen.getByText("Test job completed")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    // Style check (green badge for 'Completed')
    const completedStatus = screen.getByText("Completed");
    expect(completedStatus).toHaveStyle("background-color: #4caf50");
  });
});
