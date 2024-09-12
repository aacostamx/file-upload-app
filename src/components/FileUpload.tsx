import React, { useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { read, utils } from "xlsx";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";

const FileUpload: React.FC = () => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      const workbook = read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = utils.sheet_to_json<any>(sheet);

      if (parsedData.length > 0) {
        setColumnDefs(
          Object.keys(parsedData[0]).map((key) => ({
            headerName: key,
            field: key,
          }))
        );
        setFileData(parsedData);
        setOpenModal(true);
      }
    };

    if (
      fileExtension === "csv" ||
      fileExtension === "xlsx" ||
      fileExtension === "xls"
    ) {
      reader.readAsBinaryString(file);
    } else {
      setSnackbarMessage("Please upload a valid CSV or Excel file.");
      setSnackbarOpen(true);
    }
  };

  const handleVerifyAndSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbarMessage("File sent successfully.");
      setSnackbarOpen(true);
      setOpenModal(false);
    }, 2000);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      style={{ textAlign: "center" }}
    >
      <Grid item xs={12}>
        <Typography variant="h5">Upload File</Typography>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          component="label"
          color="primary"
          style={{ marginBottom: "20px" }}
        >
          Choose File
          <input
            type="file"
            hidden
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />
        </Button>
      </Grid>
      {fileName && (
        <Grid item xs={12}>
          <Typography variant="subtitle1">Selected: {fileName}</Typography>
        </Grid>
      )}

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Verify File Data</DialogTitle>
        <DialogContent dividers style={{ height: "400px" }}>
          <div
            className="ag-theme-alpine"
            style={{ height: "100%", width: "100%" }}
          >
            <AgGridReact
              rowData={fileData}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              domLayout="autoHeight"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenModal(false)}
            startIcon={<CancelIcon />}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerifyAndSubmit}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleOutlineIcon />
              )
            }
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Grid>
  );
};

export default FileUpload;
