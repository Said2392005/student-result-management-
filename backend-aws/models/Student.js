const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    rollNo:     { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    year:       { type: String, required: true },
    email:      { type: String, trim: true },
    photoUrl:   { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
