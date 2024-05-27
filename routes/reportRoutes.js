const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController.js');

// Get all reports
router.get('/', reportController.getAllReports);

// Get report by ID
router.get('/:id', reportController.getReportById);

// Create a new report
router.post('/', reportController.createReport);

// Update a report
router.put('/:id', reportController.updateReport);

// Delete a report
router.delete('/:id', reportController.deleteReport);

module.exports = router;
