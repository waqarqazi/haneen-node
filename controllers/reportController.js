const Report = require('../models/Report');
const ErrorResponse = require('../utils/errorResponse.js');
// Get all reports
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Create a new report
const createReport = async (req, res) => {
  const { reporter_id, reported_user_id, reason } = req.body;

  try {
    let report = new Report({
      reporter_id,
      reported_user_id,
      reason,
    });

    await report.save();
    res.json(report);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Update a report
const updateReport = async (req, res) => {
  const { reason } = req.body;

  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    report.reason = reason || report.reason;

    await report.save();
    res.json(report);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    await report.remove();
    res.json({ msg: 'Report removed' });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
};
