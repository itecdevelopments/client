import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { getRegions, createRegion } from "../api/regions";

export default function RegionsDataGrid() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🟢 Fetch Regions
  const fetchRegions = async () => {
    try {
      const res = await getRegions();
      const data = res.data?.data?.regions || res.data?.regions || [];

      const formatted = data.map((r) => ({
        id: r._id,
        name: r.name,
        code: r.code,
        createdAt: new Date(r.createdAt || Date.now()).toLocaleDateString(),
      }));

      setRows(formatted);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load regions");
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  // 🟢 Create Region
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createRegion({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      });
      setForm({ name: "", code: "" });
      await fetchRegions();
      setSuccess("✅ Region added successfully");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error adding region");
    } finally {
      setLoading(false);
    }
  };

  // 📋 Columns for DataGrid (no edit/delete)
  const columns = [
    { field: "name", headerName: "Region Name", flex: 1 },
    { field: "code", headerName: "Code", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
    },
  ];

  const paginationModel = { page: 0, pageSize: 20 };

  return (
    <Box sx={{ p: 3 }}>
      <h1 className="text-xl font-semibold mb-3">Regions</h1>
      <p className="text-gray-600 mb-4">
        View and add regions — editing or deleting regions is not allowed.
      </p>

      {/* Create Region Form */}
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
          label="Region Name"
          variant="outlined"
          size="small"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <TextField
          label="Region Code"
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
          {loading ? "Adding..." : "Add Region"}
        </Button>
      </Box>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <Paper sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20, 30]}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>
    </Box>
  );
}
