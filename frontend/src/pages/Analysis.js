import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import axios from 'axios';

ChartJS.register(...registerables);

const Analysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState(0);
  const [charts, setCharts] = useState([]);

  const { analysisId } = useParams();

  const fetchAnalysisData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/analysis/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalysisData(response.data);
      setHeaders(Object.keys(response.data.data[0]));
      setCharts(response.data.charts);
    } catch (error) {
      toast.error('Failed to fetch analysis data');
    }
  };

  const generateChart = async () => {
    if (!xColumn || !yColumn) {
      toast.error('Please select both X and Y columns');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/analysis/chart',
        {
          analysisId,
          chartType,
          xColumn,
          yColumn,
          title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setCharts([...charts, response.data.chart]);
      toast.success('Chart generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate chart');
    }
  };

  React.useEffect(() => {
    fetchAnalysisData();
  }, [analysisId]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart Title',
      },
    },
  };

  const chartData = {
    labels: analysisData?.data.map(row => row[xColumn]) || [],
    datasets: [
      {
        label: yColumn,
        data: analysisData?.data.map(row => row[yColumn]) || [],
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Chart Controls */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Generate Chart
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>X-Axis</InputLabel>
                <Select
                  value={xColumn}
                  label="X-Axis"
                  onChange={(e) => setXColumn(e.target.value)}
                >
                  {headers.map((header) => (
                    <MenuItem key={header} value={header}>
                      {header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Y-Axis</InputLabel>
                <Select
                  value={yColumn}
                  label="Y-Axis"
                  onChange={(e) => setYColumn(e.target.value)}
                >
                  {headers.map((header) => (
                    <MenuItem key={header} value={header}>
                      {header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                fullWidth
                onClick={generateChart}
                disabled={!xColumn || !yColumn}
              >
                Generate Chart
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Generated Charts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Generated Charts
            </Typography>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              {charts.map((chart, index) => (
                <Tab key={index} label={chart.title} />
              ))}
            </Tabs>
            {charts[activeTab] && (
              <Box sx={{ height: 400 }}>
                {chartType === 'bar' && (
                  <Bar data={chartData} options={chartOptions} />
                )}
                {chartType === 'line' && (
                  <Line data={chartData} options={chartOptions} />
                )}
                {chartType === 'pie' && (
                  <Pie data={chartData} options={chartOptions} />
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analysis;
