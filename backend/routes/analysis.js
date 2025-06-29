const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Upload and analyze Excel file
router.post('/', verifyToken, async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Get column headers
    const headers = Object.keys(data[0]);

    // Create analysis record
    const analysis = await new Promise((resolve) => {
      db.run(
        'INSERT INTO analysis (userId, fileName, data) VALUES (?, ?, ?)',
        [req.userId, file.originalname, JSON.stringify(data)],
        function(err) {
          if (err) throw err;
          resolve({ id: this.lastID });
        }
      );
    });

    // Update user's analysis history
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO analysis_history (userId, analysisId, timestamp) VALUES (?, ?, ?)',
        [req.userId, analysis.id, new Date()],
        function(err) {
          if (err) throw err;
          resolve();
        }
      );
    });

    res.json({
      analysisId: analysis.id,
      headers,
      message: 'File uploaded and analyzed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate chart
router.post('/chart', verifyToken, async (req, res) => {
  try {
    const { analysisId, chartType, xColumn, yColumn, title } = req.body;

    // Find analysis
    const analysis = await new Promise((resolve) => {
      db.get('SELECT * FROM analysis WHERE id = ?', [analysisId], (err, row) => {
        resolve(row);
      });
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Validate user access
    if (analysis.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Extract data for chart
    const data = JSON.parse(analysis.data);
    const chartData = data.map(row => ({
      x: row[xColumn],
      y: row[yColumn]
    }));

    // Add chart to analysis
    await new Promise((resolve) => {
      db.run(
        'INSERT INTO charts (analysisId, type, xColumn, yColumn, title, data) VALUES (?, ?, ?, ?, ?, ?)',
        [analysisId, chartType, xColumn, yColumn, title, JSON.stringify(chartData)],
        function(err) {
          if (err) throw err;
          resolve();
        }
      );
    });

    res.json({
      chart: {
        type: chartType,
        title,
        data: chartData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's analysis history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const history = await new Promise((resolve) => {
      const query = `
        SELECT a.*, u.username 
        FROM analysis_history ah 
        JOIN analysis a ON ah.analysisId = a.id 
        JOIN users u ON a.userId = u.id 
        WHERE ah.userId = ? 
        ORDER BY ah.timestamp DESC
      `;
      db.all(query, [req.userId], (err, rows) => {
        if (err) throw err;
        resolve(rows.map(row => ({
          id: row.id,
          fileName: row.fileName,
          timestamp: row.timestamp,
          username: row.username
        })));
      });
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
