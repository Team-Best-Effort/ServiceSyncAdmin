import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// import 
import EmployeeManagement from "./page"; 

// ✅ Mock Firebase config module
vi.mock("./lib/firebase", () => ({
  db: {},
}));

// ✅ Mock Firebase database functions
vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  onValue: (ref: any, callback: any) => {
    callback({
      val: () => ({
        AB123: {
          name: "John Doe",
          email: "john@example.com",
          phone: "123456",
          password: "abc123",
        },
        CD456: {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "654321",
          password: "xyz789",
        },
      }),
    });
  },
  get: vi.fn().mockResolvedValue({ exists: () => false }),
  set: vi.fn().mockResolvedValue(true),
  update: vi.fn().mockResolvedValue(true),
  remove: vi.fn().mockResolvedValue(true),
}));

// ✅ Stub global confirm for deletion
vi.stubGlobal("confirm", vi.fn(() => true));

describe("EmployeeManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the employee list from Firebase", async () => {
    render(<EmployeeManagement />);
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("opens and closes the 'Add New Employee' dialog", async () => {
    render(<EmployeeManagement />);
    
    // ✅ Target only the button, not the title
    const addButton = screen.getByRole("button", { name: "Add New Employee" });
    fireEvent.click(addButton);

    // ✅ Check for a dialog-specific element (input label)
    expect(screen.getByLabelText("Name")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));

    // ✅ Wait for dialog to close
    await waitFor(() =>
      expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
    );
  });

  it("submits a new employee successfully", async () => {
    render(<EmployeeManagement />);
    const addButton = screen.getByRole("button", { name: "Add New Employee" });
    fireEvent.click(addButton);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "5551234" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass123" } });

    fireEvent.click(screen.getByText("Submit"));

    // ✅ Wait for dialog to close
    await waitFor(() =>
      expect(screen.queryByText("Submit")).not.toBeInTheDocument()
    );
  });

  it("opens the edit dialog with correct data", async () => {
    render(<EmployeeManagement />);
    const editButtons = await screen.findAllByText("Edit");

    fireEvent.click(editButtons[0]);

    expect(screen.getByText("Edit Employee")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });

  it("deletes an employee", async () => {
    render(<EmployeeManagement />);
    const deleteButtons = await screen.findAllByText("Delete");

    fireEvent.click(deleteButtons[0]);

    expect(confirm).toHaveBeenCalled();
  });
});
