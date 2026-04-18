const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  marks:    { type: Number, required: true },
  maxMarks: { type: Number, required: true, default: 100 },
  grade:    { type: String, required: true },
});

const ResultSchema = new mongoose.Schema(
  {
    student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester:     { type: String, required: true },
    subjects:     [SubjectSchema],
    totalMarks:   { type: Number },
    maxTotalMarks:{ type: Number },
    percentage:   { type: Number },
    status:       { type: String, enum: ['Pass', 'Fail'] },
    remarks:      { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', ResultSchema);
