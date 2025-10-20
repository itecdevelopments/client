import * as React from "react";
import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { getUsers, createUser, updateUser, deleteUser } from "../api/users";
import { getRegions } from "../api/regions";

export default function UsersDataGrid() {
  const [rows, setRows] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    passwordConfirm: "",
    role: "ENG",
    regionCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const formatted = res.data.data.users.map((u) => ({
        id: u._id,
        name: u.name,
        username: u.username,
        role: u.role,
        regionName: u.region?.name ?? "NAN",
        regionCode: u.region?.code ?? "NAN",
        // createdAt: new Date(u.createdAt).toLocaleDateString(),
        // createdAt: new Date(Date.parse(u.region?.createdAt)),
        createdAt: new Date(u.region?.createdAt),
      }));
      setRows(formatted);

      setError("");
    } catch (err) {
      console.error("❌ Failed to load users:", err);
      setError("Failed to load users");
    }
  };

  // ✅ Fetch Regions
  const fetchRegions = async () => {
    try {
      const res = await getRegions();
      setRegions(res.data.data.regions || []);
    } catch (err) {
      console.error("❌ Failed to load regions:", err);
      setError("Failed to load regions");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRegions();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Create User
  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.username.trim() ||
      !form.password.trim() ||
      !form.passwordConfirm.trim() ||
      !form.regionCode.trim()
    ) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createUser({
        name: form.name.trim(),
        username: form.username.trim(),
        password: form.password.trim(),
        passwordConfirm: form.passwordConfirm.trim(),
        region: form.regionCode.trim().toUpperCase(),
        role: form.role,
      });
      setForm({
        name: "",
        username: "",
        password: "",
        passwordConfirm: "",
        role: "ENG",
        regionCode: "",
      });
      await fetchUsers();
      setSuccess("✅ User added successfully");
    } catch (err) {
      console.error("❌ Error creating user:", err);
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update User
  const handleUpdate = async (id) => {
    const updated = rows.find((r) => r.id === id);
    try {
      await updateUser(id, { name: updated.name.trim() });
      setSuccess("User updated successfully");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error updating user:", err);
      setError("Error updating user");
    }
  };

  // ✅ Delete User
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
      setSuccess("User deleted successfully");
    } catch {
      setError("Error deleting user");
    }
  };

  // ✅ Handle CSV Upload
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
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
        "https://srv-rpt-1-0-mu.vercel.app/api/v1/users/upload-csv",
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
          `✅ Uploaded ${data.results || 0} users, skipped ${
            data.skipped || 0
          } duplicates.`
        );
        fetchUsers();
      } else {
        setError(data.message || "Failed to upload CSV.");
      }
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ DataGrid Columns
  const columns = [
    { field: "name", headerName: "Name", flex: 1, editable: true },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "regionName", headerName: "Region", flex: 1 },
    { field: "regionCode", headerName: "Region Code", flex: 1 },
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

  // ✅ Render
  return (
    <Box sx={{ p: 3 }}>
      <h1 className="text-xl font-semibold mb-3">Users</h1>
      <p className="text-gray-600 mb-4">
        Manage system users — add, update, delete, or bulk upload via CSV.
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
          name="name"
          variant="outlined"
          size="small"
          value={form.name}
          onChange={handleChange}
          required
        />
        <TextField
          label="Username"
          name="username"
          variant="outlined"
          size="small"
          value={form.username}
          onChange={handleChange}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          variant="outlined"
          size="small"
          value={form.password}
          onChange={handleChange}
          required
        />
        <TextField
          label="Confirm Password"
          name="passwordConfirm"
          type="password"
          variant="outlined"
          size="small"
          value={form.passwordConfirm}
          onChange={handleChange}
          required
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={form.role}
            label="Role"
            onChange={handleChange}
          >
            <MenuItem value="ENG">Engineer</MenuItem>
            <MenuItem value="BM">Branch Manager</MenuItem>
            <MenuItem value="CM">Country Manager</MenuItem>
            <MenuItem value="VXR">Admin (VXR)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Region</InputLabel>
          <Select
            name="regionCode"
            value={form.regionCode}
            label="Region"
            onChange={handleChange}
            required
          >
            {regions.length === 0 ? (
              <MenuItem disabled>Loading regions...</MenuItem>
            ) : (
              regions.map((region) => (
                <MenuItem key={region._id} value={region.code}>
                  {region.name} ({region.code})
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
          {loading ? "Adding..." : "Add User"}
        </Button>

        {/* CSV Upload */}
        {/* <Button variant="outlined" component="label">
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleCSVUpload} />
        </Button> */}
      </Box>

      {error && (
        <p className="text-sm font-medium text-red-600 my-2">{error}</p>
      )}

      {success && (
        <p className="text-sm font-medium text-green-600 mt-2">{success}</p>
      )}

      {/* Table */}
      <Paper sx={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20, 30]}
          disableRowSelectionOnClick
          processRowUpdate={(newRow) => {
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
