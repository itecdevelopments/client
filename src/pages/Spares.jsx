import * as React from "react";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Papa from "papaparse"; // ✅ CSV parsing library
import {
  getSpares,
  createSpare,
  updateSpare,
  deleteSpare,
} from "../api/spares";

export default function SparesDataGrid() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch spares
  const fetchSpares = async () => {
    try {
      const res = await getSpares();
      const formatted = res.data.spares.map((s) => ({
        id: s._id,
        name: s.name,
        code: s.code,
        createdAt: new Date(s.createdAt).toLocaleDateString(),
      }));
      setRows(formatted);
      setError("");
    } catch {
      setError("Failed to load spares");
    }
  };

  useEffect(() => {
    fetchSpares();
  }, []);

  // Create spare
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError("Both fields are required");
      return;
    }
    setLoading(true);
    try {
      await createSpare({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      });
      setForm({ name: "", code: "" });
      await fetchSpares();
      setSuccess("Spare added successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding spare");
    } finally {
      setLoading(false);
    }
  };

  // Delete spare
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this spare?")) return;
    try {
      await deleteSpare(id);
      fetchSpares();
    } catch {
      setError("Error deleting spare");
    }
  };

  // Update spare manually via Update button
  const handleUpdate = async (id) => {
    const updated = rows.find((r) => r.id === id);
    try {
      await updateSpare(id, {
        name: updated.name.trim(),
        code: updated.code.trim().toUpperCase(),
      });
      setSuccess("Spare updated successfully");
      fetchSpares();
    } catch {
      setError("Error updating spare");
    }
  };

  // Handle CSV Upload
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token"); // 👈 get your saved JWT
    if (!token) {
      setError("You must be logged in to upload files.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        "https://srv-rpt-1-0-mu.vercel.app/api/v1/spares/upload-csv",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess(
          `✅ Uploaded ${data.results} spares, skipped ${data.skipped} duplicates.`
        );
        fetchSpares();
      } else {
        setError(data.message || "Failed to upload CSV.");
      }
    } catch (err) {
      console.error(err);
      setError("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const columns = [
    { field: "name", headerName: "Name", flex: 1, editable: true },
    { field: "code", headerName: "Code", flex: 1, editable: true },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleUpdate(params.row.id)}
          >
            Update
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 30 };

  return (
    <Box sx={{ p: 3 }}>
      <h1 className="text-xl font-semibold mb-3">Spare Parts</h1>
      <p className="text-gray-600 mb-4">
        Manage spare parts — you can add, update, delete, or bulk upload via
        CSV.
      </p>

      {/* Add / Upload Form */}
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label="Name"
          variant="outlined"
          size="small"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <TextField
          label="Code"
          variant="outlined"
          size="small"
          value={form.code}
          onChange={(e) =>
            setForm({ ...form, code: e.target.value.toUpperCase() })
          }
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Spare"}
        </Button>

        {/* CSV Upload */}
        <Button variant="outlined" component="label">
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleCSVUpload} />
        </Button>
      </Box>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Table */}
      <Paper sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20, 30]}
          disableRowSelectionOnClick
          processRowUpdate={(newRow, oldRow) => {
            const updated = rows.map((r) =>
              r.id === newRow.id ? { ...r, ...newRow } : r
            );
            setRows(updated);
            return newRow;
          }}
          experimentalFeatures={{ newEditingApi: true }}
          sx={{ border: 0 }}
        />
      </Paper>
    </Box>
  );
}
