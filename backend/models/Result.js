const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  marks: { type: Number, required: true, min: 0, max: 100 },
  grade: { type: String, required: true, trim: true },
});

const ResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 10,
    },
    subjects: {
      type: [SubjectSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one subject is required',
      },
    },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', ResultSchema);
