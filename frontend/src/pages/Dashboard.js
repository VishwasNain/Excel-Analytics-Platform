import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/analysis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'File upload failed');
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analysis/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalysisHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch analysis history');
    }
  };

  React.useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Upload Excel File
            </Typography>
            <Box sx={{ mb: 2 }}>
              <input
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="contained"
                  component="span"
                  fullWidth
                  disabled={!selectedFile}
                  onClick={handleFileUpload}
                >
                  {selectedFile ? selectedFile.name : 'Upload Excel File'}
                </Button>
              </label>
            </Box>
          </Paper>
        </Grid>

        {/* History Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Analysis History
            </Typography>
            <Box sx={{ mt: 2 }}>
              {analysisHistory.map((analysis) => (
                <Card key={analysis.fileId._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {analysis.fileId.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(analysis.timestamp).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/analysis/${analysis.fileId._id}`)}
                    >
                      View Analysis
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
