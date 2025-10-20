import { useEffect, useState, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { getAllReports } from "../api/reports";
import CloseIcon from "@mui/icons-material/Close";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Documents() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const pdfRef = useRef(null);

  // ✅ Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllReports();

      const formatted =
        res?.data?.data?.map((r) => ({
          ...r,
          id: r._id,
        })) || [];
      setRows(formatted);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleView = (report) => {
    setSelectedReport(report);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedReport(null);
  };

  // ✅ Generate PDF
  const handleGeneratePDF = async () => {
    if (!pdfRef.current) return;
    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${selectedReport?.SerialReportNumber || "report"}.pdf`);
  };

  // ✅ Export to Excel
  const handleExportExcel = () => {
    if (!rows.length) return alert("No data to export");

    // Exclude MongoDB _id and any unnecessary internal fields
    const cleanData = rows.map(({ _id, __v, ...rest }) => rest);

    // Create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    // Format column widths for better readability
    const columnWidths = Object.keys(cleanData[0] || {}).map(() => ({
      wch: 20,
    }));
    worksheet["!cols"] = columnWidths;

    // Convert workbook to binary & trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const filename = `Reports_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(blob, filename);
  };

  // ✅ DataGrid columns (summary)
  const columns = [
    { field: "SerialReportNumber", headerName: "Report No.", flex: 1 },
    { field: "Date", headerName: "Date", flex: 1 },
    { field: "Customer", headerName: "Customer", flex: 1.2 },
    { field: "region", headerName: "Region", flex: 1 },
    { field: "engineerName", headerName: "Engineer", flex: 1 },
    { field: "MachineType", headerName: "Machine Type", flex: 1 },
    { field: "ServiceType", headerName: "Service Type", flex: 1 },
    { field: "JobCompleted", headerName: "Completed", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 160,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          // onClick={() => handleView(params.row.fullData)}
          onClick={() => {
            handleView(params.row);
          }}
        >
          View PDF
        </Button>
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 20 };

  return (
    <Box sx={{ p: 3 }}>
      <h1 className="text-xl font-semibold mb-3">
        Reports - {localStorage.getItem("regionName")}
      </h1>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" color="primary" onClick={fetchReports}>
          Refresh
        </Button>
        <Button variant="outlined" color="success" onClick={handleExportExcel}>
          Export to Excel
        </Button>
      </Box>

      {error && <p className="text-sm text-red-600 my-2">{error}</p>}

      <Paper sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>

      {/* ✅ Full PDF Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReport?.SerialReportNumber || "Report Details"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedReport ? (
            <div
              ref={pdfRef}
              style={{
                padding: "5vw",
                fontFamily: "Inter, sans-serif",
                color: "#1f2937",
                backgroundColor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                border: "1px solid #e5e7eb",
                maxWidth: "1000px",
                margin: "auto",
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "3px solid #0073E6",
                  paddingBottom: "12px",
                  marginBottom: "25px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ flex: "1 1 250px" }}>
                  <h1
                    style={{
                      fontSize: "clamp(18px, 2.5vw, 22px)",
                      fontWeight: "700",
                      margin: 0,
                    }}
                  >
                    SERVICE REPORT
                  </h1>
                  <p
                    style={{
                      fontSize: "clamp(11px, 1.6vw, 13px)",
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Generated on: {new Date().toLocaleString()}
                  </p>
                </div>
                <img
                  src="/images/iteclogo.png"
                  alt="ITEC Logo"
                  style={{
                    height: "clamp(40px, 6vw, 60px)",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* REUSABLE SECTION TITLE */}
              {[
                {
                  title: "Customer Information",
                  fields: [
                    ["Customer", selectedReport.Customer],
                    ["Region", selectedReport.region],
                    ["Concern Name", selectedReport.concernName],
                    ["Designation", selectedReport.customerdesignation],
                    ["Phone", selectedReport.customerPhoneNumber],
                    ["Quotation", selectedReport.Quotation],
                    ["Purchase Order", selectedReport.PurchaseOrder],
                  ],
                },
                {
                  title: "Machine Information",
                  fields: [
                    ["Machine Type", selectedReport.MachineType],
                    ["Model", selectedReport.Model],
                    ["Serial Number", selectedReport.SerialNumber],
                    ["INK Type", selectedReport.INKtype],
                    ["Solvent Type", selectedReport.SolventType],
                    ["Power ON Time", selectedReport.powerONtime],
                    ["Jet Running Time", selectedReport.JetRunningTime],
                    ["Service Due Date", selectedReport.ServiceDueDate || "—"],
                    ["Inventory", selectedReport.Inventory],
                  ],
                },
                {
                  title: "Job Details",
                  fields: [
                    ["Engineer", selectedReport.engineerName],
                    ["Service Type", selectedReport.ServiceType],
                    ["Job Completed", selectedReport.JobCompleted],
                    ["Job Complete Reason", selectedReport.JobcompleteReason],
                    ["Date Entered", selectedReport.dateEntered],
                    [
                      "Created At",
                      new Date(selectedReport.createdAt).toLocaleString(),
                    ],
                  ],
                },
              ].map((section, idx) => (
                <div key={idx} style={{ marginBottom: "25px" }}>
                  <h2
                    style={{
                      fontSize: "clamp(15px, 2vw, 16px)",
                      fontWeight: "600",
                      marginBottom: "10px",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    {section.title}
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px 20px",
                    }}
                  >
                    {section.fields.map(([label, value]) => (
                      <p key={label} style={{ margin: 0 }}>
                        <strong>{label}:</strong> {value}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* DESCRIPTION */}
              <div style={{ marginBottom: "25px" }}>
                <h3
                  style={{
                    fontSize: "clamp(15px, 2vw, 16px)",
                    fontWeight: "600",
                    marginBottom: "8px",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Description
                </h3>
                <p
                  style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "14px",
                    minHeight: "70px",
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                  }}
                >
                  {selectedReport.description || "No description provided."}
                </p>
              </div>

              {/* SPARE PARTS */}
              <div style={{ marginBottom: "25px" }}>
                <h3
                  style={{
                    fontSize: "clamp(15px, 2vw, 16px)",
                    fontWeight: "600",
                    marginBottom: "8px",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  Spare Parts Used
                </h3>
                {selectedReport.spare?.length ? (
                  <ul
                    style={{
                      marginLeft: "20px",
                      fontSize: "clamp(12px, 1.8vw, 14px)",
                    }}
                  >
                    {selectedReport.spare.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p>—</p>
                )}
              </div>

              {/* FOOTER */}
              <div
                style={{
                  borderTop: "2px solid #e5e7eb",
                  marginTop: "35px",
                  paddingTop: "12px",
                  textAlign: "center",
                  fontSize: "clamp(10px, 1.5vw, 12px)",
                  color: "#9ca3af",
                }}
              >
                <p>© {new Date().getFullYear()} ITEC | Service Report System</p>
                <p>
                  <em>Authorized Service by ITEC Engineering Division</em>
                </p>
                <p>
                  This document is digitally generated and does not require a
                  signature.
                </p>
              </div>
            </div>
          ) : (
            <p>No report selected</p>
          )}

          <Button
            variant="contained"
            color="secondary"
            onClick={handleGeneratePDF}
            sx={{ mt: 2 }}
          >
            Download as PDF
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
