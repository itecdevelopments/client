import * as React from "react";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getRegions } from "../api/regions";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  uploadCustomersCSV,
} from "../api/customers";

export default function CustomersDataGrid() {
  const [rows, setRows] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", regionCode: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCustomers();
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await getRegions();
      console.log("✅ Regions response:", res.data);
      setRegions(res.data.data.regions || []);
    } catch (err) {
      console.error("❌ Failed to load regions:", err);
      setError("Failed to load regions");
    }
  };

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers();
      const formatted = res.data.customers.map((c) => ({
        id: c._id,
        name: c.name,
        customerId: c.customerId,
        regionName: c.region?.name ?? "—",
        regionCode: c.region?.code ?? "—",
      }));
      setRows(formatted); // ✅ Always replace, never append
      setError("");
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create new customer
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.regionCode.trim()) {
      setError("Both fields are required");
      return;
    }
    setLoading(true);
    try {
      await createCustomer({
        name: form.name.trim(),
        regionCode: form.regionCode.trim().toUpperCase(),
      });
      setForm({ name: "", regionCode: "" });
      setSuccess("Customer added successfully");
      fetchCustomers();
    } catch (err) {
      console.error("❌ Error creating customer:", err);
      setError(err.response?.data?.message || "Error adding customer");
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
      setSuccess("Customer deleted");
    } catch (err) {
      console.error("❌ Error deleting:", err);
      setError("Error deleting customer");
    }
  };

  // Update customer
  const handleUpdate = async (id) => {
    const updated = rows.find((r) => r.id === id);
    if (!updated) return;
    try {
      await updateCustomer(id, {
        name: updated.name.trim(),
        regionCode: updated.regionCode.trim().toUpperCase(),
      });
      setSuccess("Customer updated successfully");
      fetchCustomers();
    } catch (err) {
      console.error("❌ Error updating:", err);
      setError("Error updating customer");
    }
  };

  // Handle CSV upload
  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await uploadCustomersCSV(file);
      const data = res.data.results || {};
      setSuccess(
        `✅ Uploaded successfully. Added: ${data.added || 0}, Skipped: ${
          data.skipped || 0
        }.`
      );
      fetchCustomers();
    } catch (err) {
      console.error("❌ CSV upload failed:", err);
      setError("Error uploading CSV file.");
    } finally {
      setLoading(false);
    }
  };

  // Columns
  const columns = [
    { field: "name", headerName: "Customer Name", flex: 1, editable: true },
    { field: "customerId", headerName: "Customer ID", flex: 1 },
    {
      field: "regionName",
      headerName: "Region",
      flex: 1,
    },
    {
      field: "regionCode",
      headerName: "Region Code",
      flex: 1,
      editable: false,
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

  const paginationModel = { page: 0, pageSize: 25 };

  return (
    <Box sx={{ p: 3 }}>
      <h1 className="text-xl font-semibold mb-3">Customers</h1>
      <p className="text-gray-600 mb-4">
        Manage customer records — add, update, delete, or bulk upload via CSV.
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
          label="Customer Name"
          name="name"
          variant="outlined"
          size="small"
          value={form.name}
          onChange={handleChange}
          required
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="region-label">Region</InputLabel>
          <Select
            labelId="region-label"
            label="Region"
            name="regionCode"
            value={form.regionCode}
            onChange={handleChange}
            required
          >
            {regions.length === 0 ? (
              <MenuItem disabled>Loading regions...</MenuItem>
            ) : (
              regions.map((region) => (
                <MenuItem key={region._id} value={region.code}>
                  {region.name} — {region.country} ({region.code})
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Customer"}
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
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          processRowUpdate={(newRow /* oldRow*/) => {
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
