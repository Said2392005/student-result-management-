// Run once: node scripts/seedData.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../models/Student');
const Result = require('../models/Result');

const studentData = [
  { name: 'Rahul Sharma', rollNo: 'CS001', department: 'Computer Science', year: '3rd', email: 'rahul@example.com' },
  { name: 'Priya Patel',  rollNo: 'CS002', department: 'Computer Science', year: '3rd', email: 'priya@example.com' },
  { name: 'Amit Singh',   rollNo: 'CS003', department: 'Computer Science', year: '2nd', email: 'amit@example.com' },
  { name: 'Sneha Desai',  rollNo: 'ME001', department: 'Mechanical',       year: '2nd', email: 'sneha@example.com' },
  { name: 'Rohit Kumar',  rollNo: 'ME002', department: 'Mechanical',       year: '3rd', email: 'rohit@example.com' },
  { name: 'Pooja Joshi',  rollNo: 'EC001', department: 'Electronics',      year: '1st', email: 'pooja@example.com' },
  { name: 'Vikram Rao',   rollNo: 'EC002', department: 'Electronics',      year: '2nd', email: 'vikram@example.com' },
  { name: 'Ananya Mehta', rollNo: 'CS004', department: 'Computer Science', year: '1st', email: 'ananya@example.com' },
  { name: 'Suresh Nair',  rollNo: 'ME003', department: 'Mechanical',       year: '1st', email: 'suresh@example.com' },
  { name: 'Kavya Reddy',  rollNo: 'EC003', department: 'Electronics',      year: '3rd', email: 'kavya@example.com' },
];

const subjectMap = {
  'Computer Science': [
    { name: 'Data Structures', marks: 78, maxMarks: 100, grade: 'A'  },
    { name: 'Mathematics',     marks: 65, maxMarks: 100, grade: 'B'  },
    { name: 'Physics',         marks: 70, maxMarks: 100, grade: 'B'  },
    { name: 'Programming',     marks: 90, maxMarks: 100, grade: 'A+' },
  ],
  'Mechanical': [
    { name: 'Engineering Drawing', marks: 72, maxMarks: 100, grade: 'A' },
    { name: 'Thermodynamics',      marks: 60, maxMarks: 100, grade: 'B' },
    { name: 'Mathematics',         marks: 68, maxMarks: 100, grade: 'B' },
    { name: 'Workshop',            marks: 80, maxMarks: 100, grade: 'A' },
  ],
  'Electronics': [
    { name: 'Circuit Theory', marks: 75, maxMarks: 100, grade: 'A' },
    { name: 'Electronics',    marks: 82, maxMarks: 100, grade: 'A' },
    { name: 'Mathematics',    marks: 71, maxMarks: 100, grade: 'A' },
    { name: 'Physics',        marks: 66, maxMarks: 100, grade: 'B' },
  ],
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected to Atlas ✅');

  await Student.deleteMany({});
  await Result.deleteMany({});
  console.log('Cleared existing students and results');

  const students = await Student.insertMany(studentData);
  console.log(`Inserted ${students.length} students`);

  const results = [];
  for (const student of students) {
    const subjects = subjectMap[student.department];
    const totalMarks = subjects.reduce((s, x) => s + x.marks, 0);
    const maxTotalMarks = subjects.reduce((s, x) => s + x.maxMarks, 0);
    const percentage = parseFloat(((totalMarks / maxTotalMarks) * 100).toFixed(2));

    results.push({
      student: student._id,
      semester: '1',
      subjects,
      totalMarks,
      maxTotalMarks,
      percentage,
      status: percentage >= 40 ? 'Pass' : 'Fail',
    });
  }

  const inserted = await Result.insertMany(results);
  console.log(`Inserted ${inserted.length} results`);

  console.log('\nSeeding complete ✅');
  console.log(`  Students : ${students.length}`);
  console.log(`  Results  : ${inserted.length}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
