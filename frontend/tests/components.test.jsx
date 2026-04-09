/**
 * tests/components.test.jsx
 * Unit tests for shared frontend components.
 *
 * Run: cd frontend && npm test
 * Requires: vitest + @testing-library/react (add to devDependencies)
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ToastProvider } from "../src/context/ToastContext";
import { AuthProvider } from "../src/context/AuthContext";
import ToastViewport from "../src/components/ToastViewport";
import ProtectedRoute from "../src/components/ProtectedRoute";

// ---------------------------------------------------------------------------
// Helper wrappers
// ---------------------------------------------------------------------------

function WithProviders({ children }) {
  return (
    <MemoryRouter>
      <ToastProvider>
        {children}
      </ToastProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// ToastViewport
// ---------------------------------------------------------------------------

describe("ToastViewport", () => {
  it("renders nothing when there is no active toast", () => {
    const { container } = render(
      <WithProviders>
        <ToastViewport />
      </WithProviders>
    );
    expect(container.firstChild).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------

vi.mock("../src/context/AuthContext", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn()
}));

import { useAuth } from "../src/context/AuthContext";

describe("ProtectedRoute", () => {
  it("shows loading indicator while auth is resolving", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Protected content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it("redirects to / when user is not authenticated", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={["/bookings"]}>
        <ProtectedRoute>
          <p>Protected content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Protected content")).toBeNull();
  });

  it("renders children when user is authenticated", () => {
    useAuth.mockReturnValue({
      user: { role: "customer", name: "Test" },
      loading: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Protected content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Protected content")).toBeDefined();
  });

  it("redirects when user role is not in the allowed roles list", () => {
    useAuth.mockReturnValue({
      user: { role: "customer", name: "Test" },
      loading: false
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <ProtectedRoute roles={["admin"]}>
          <p>Admin only content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("Admin only content")).toBeNull();
  });

  it("renders children when user role matches", () => {
    useAuth.mockReturnValue({
      user: { role: "admin", name: "Admin" },
      loading: false
    });

    render(
      <MemoryRouter>
        <ProtectedRoute roles={["admin"]}>
          <p>Admin only content</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin only content")).toBeDefined();
  });
});
