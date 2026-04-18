const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const protect = require('../middleware/auth');

// GET /api/results
router.get('/', protect, async (req, res) => {
  try {
    const { semester, status } = req.query;
    const filter = {};

    if (semester) filter.semester = parseInt(semester);
    if (status) filter.status = status;

    const results = await Result.find(filter)
      .populate('student', 'name rollNo department year')
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/results
router.post('/', protect, async (req, res) => {
  try {
    const { student, semester, subjects } = req.body;

    if (!student || !semester || !subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const totalMarks = subjects.reduce((sum, s) => sum + Number(s.marks), 0);
    const percentage = parseFloat((totalMarks / (subjects.length * 100)) * 100).toFixed(2);
    const status = parseFloat(percentage) >= 40 ? 'Pass' : 'Fail';

    const result = await Result.create({
      student,
      semester,
      subjects,
      totalMarks,
      percentage: parseFloat(percentage),
      status,
    });

    const populated = await result.populate('student', 'name rollNo department year');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/results/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { student, semester, subjects } = req.body;

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'At least one subject is required' });
    }

    const totalMarks = subjects.reduce((sum, s) => sum + Number(s.marks), 0);
    const percentage = parseFloat((totalMarks / (subjects.length * 100)) * 100).toFixed(2);
    const status = parseFloat(percentage) >= 40 ? 'Pass' : 'Fail';

    const result = await Result.findByIdAndUpdate(
      req.params.id,
      { student, semester, subjects, totalMarks, percentage: parseFloat(percentage), status },
      { new: true, runValidators: true }
    ).populate('student', 'name rollNo department year');

    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/results/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json({ message: 'Result deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
