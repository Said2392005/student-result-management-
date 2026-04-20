const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Result = require('../models/Result');
const protect = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/students
router.get('/', protect, async (req, res) => {
  try {
    const { department, year, search } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/students
router.post('/', protect, async (req, res) => {
  try {
    const { name, rollNo, department, year } = req.body;

    if (!name || !rollNo || !department || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Student.findOne({ rollNo });
    if (existing) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    const student = await Student.create({ name, rollNo, department, year });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/students/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, rollNo, department, year } = req.body;

    const duplicate = await Student.findOne({
      rollNo,
      _id: { $ne: req.params.id },
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, rollNo, department, year },
      { new: true, runValidators: true }
    );

    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await Result.deleteMany({ student: req.params.id });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/photo  (base64 → stored as data URL for Express/dev)
router.post('/upload/photo', protect, async (req, res) => {
  try {
    const { fileData, fileType, studentId } = req.body;
    if (!fileData || !fileType) {
      return res.status(400).json({ message: 'fileData and fileType are required' });
    }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(fileType)) {
      return res.status(400).json({ message: 'Only JPEG, PNG and WebP images are allowed' });
    }
    const base64 = fileData.replace(/^data:image\/\w+;base64,/, '');
    if (Buffer.from(base64, 'base64').length > 2 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size must be under 2MB' });
    }
    const photoUrl = fileData;
    if (studentId) {
      await Student.findByIdAndUpdate(studentId, { photoUrl });
    }
    res.json({ photoUrl, key: `local/${uuidv4()}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
