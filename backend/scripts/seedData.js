// Run with: node scripts/seedData.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../models/Student');
const Result = require('../models/Result');

const students = [
  { name: 'Rahul Sharma',  rollNo: 'CS001', department: 'Computer Science', year: 3 },
  { name: 'Priya Patel',   rollNo: 'CS002', department: 'Computer Science', year: 3 },
  { name: 'Amit Singh',    rollNo: 'CS003', department: 'Computer Science', year: 2 },
  { name: 'Sneha Desai',   rollNo: 'ME001', department: 'Mechanical',       year: 2 },
  { name: 'Rohit Kumar',   rollNo: 'ME002', department: 'Mechanical',       year: 3 },
  { name: 'Pooja Joshi',   rollNo: 'EC001', department: 'Electronics',      year: 1 },
  { name: 'Vikram Rao',    rollNo: 'EC002', department: 'Electronics',      year: 2 },
  { name: 'Ananya Mehta',  rollNo: 'CS004', department: 'Computer Science', year: 1 },
  { name: 'Suresh Nair',   rollNo: 'ME003', department: 'Mechanical',       year: 1 },
  { name: 'Kavya Reddy',   rollNo: 'EC003', department: 'Electronics',      year: 3 },
];

const subjectsByDept = {
  'Computer Science': [
    { name: 'Data Structures', marks: 78, grade: 'A'  },
    { name: 'Mathematics',     marks: 65, grade: 'B'  },
    { name: 'Physics',         marks: 70, grade: 'B'  },
    { name: 'Programming',     marks: 90, grade: 'A+' },
  ],
  'Mechanical': [
    { name: 'Engineering Drawing', marks: 72, grade: 'A' },
    { name: 'Thermodynamics',      marks: 60, grade: 'B' },
    { name: 'Mathematics',         marks: 68, grade: 'B' },
    { name: 'Workshop',            marks: 80, grade: 'A' },
  ],
  'Electronics': [
    { name: 'Circuit Theory', marks: 75, grade: 'A' },
    { name: 'Electronics',    marks: 82, grade: 'A' },
    { name: 'Mathematics',    marks: 71, grade: 'A' },
    { name: 'Physics',        marks: 66, grade: 'B' },
  ],
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected to Atlas ✅');

  await Student.deleteMany({});
  await Result.deleteMany({});
  console.log('Cleared existing students and results');

  const insertedStudents = await Student.insertMany(students);
  console.log(`Inserted ${insertedStudents.length} students`);

  const results = insertedStudents.map((student) => {
    const subjects = subjectsByDept[student.department];
    const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
    const maxTotalMarks = subjects.length * 100;
    const percentage = parseFloat(((totalMarks / maxTotalMarks) * 100).toFixed(2));
    return {
      student: student._id,
      semester: 1,
      subjects,
      totalMarks,
      percentage,
      status: percentage >= 40 ? 'Pass' : 'Fail',
    };
  });

  const insertedResults = await Result.insertMany(results);
  console.log(`Inserted ${insertedResults.length} results`);

  console.log('\nSeeding complete ✅');
  console.log(`  Students inserted : ${insertedStudents.length}`);
  console.log(`  Results inserted  : ${insertedResults.length}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
