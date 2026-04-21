const connectDB = require('../../utils/db');
const { success, error } = require('../../utils/response');
const Result = require('../../models/Result');
const Student = require('../../models/Student');
const AWS = require('aws-sdk');

const ses = new AWS.SES({ region: process.env.AWS_REGION || 'ap-south-1' });

const sendResultEmail = async (student, result) => {
  if (!student.email) return;

  const rows = result.subjects
    .map(
      (s) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd">${s.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${s.marks}/${s.maxMarks}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${s.grade}</td>
      </tr>`
    )
    .join('');

  const statusColor = result.status === 'Pass' ? '#16a34a' : '#dc2626';

  await ses
    .sendEmail({
      Source: process.env.SES_EMAIL,
      Destination: { ToAddresses: [student.email] },
      Message: {
        Subject: { Data: `Semester ${result.semester} Results — ${student.name}` },
        Body: {
          Html: {
            Data: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e5e7eb;border-radius:8px">
              <h2 style="color:#1a56db;margin-bottom:4px">Student Result System</h2>
              <p style="color:#6b7280;margin-top:0">Result Notification</p>
              <hr style="border-color:#e5e7eb"/>
              <p>Dear <strong>${student.name}</strong>,</p>
              <p>Your <strong>Semester ${result.semester}</strong> results have been published.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <thead>
                  <tr style="background:#f3f4f6">
                    <th style="padding:8px;border:1px solid #ddd;text-align:left">Subject</th>
                    <th style="padding:8px;border:1px solid #ddd">Marks</th>
                    <th style="padding:8px;border:1px solid #ddd">Grade</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
              <p><strong>Total Marks:</strong> ${result.totalMarks} / ${result.maxTotalMarks}</p>
              <p><strong>Percentage:</strong> ${result.percentage.toFixed(2)}%</p>
              <p><strong>Status:</strong>
                <span style="color:${statusColor};font-weight:bold">${result.status}</span>
              </p>
              ${result.remarks ? `<p><strong>Remarks:</strong> ${result.remarks}</p>` : ''}
              <hr style="border-color:#e5e7eb"/>
              <p style="color:#6b7280;font-size:12px">Student Result Management System</p>
            </div>`,
          },
        },
      },
    })
    .promise();
};

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: require('../../utils/response').headers, body: '' };
  try {
    await connectDB();

    const data = JSON.parse(event.body || '{}');
    const { student: studentId, semester, subjects } = data;

    if (!studentId || !semester || !subjects?.length) {
      return error('student, semester and subjects are required', 400);
    }

    const totalMarks = subjects.reduce((sum, s) => sum + Number(s.marks), 0);
    const maxTotalMarks = subjects.reduce((sum, s) => sum + Number(s.maxMarks || 100), 0);
    const percentage = parseFloat(((totalMarks / maxTotalMarks) * 100).toFixed(2));
    const status = percentage >= 40 ? 'Pass' : 'Fail';

    const result = await Result.create({
      ...data,
      totalMarks,
      maxTotalMarks,
      percentage,
      status,
    });

    const student = await Student.findById(studentId);
    if (student?.email) {
      sendResultEmail(student, result).catch((e) =>
        console.error('SES email error:', e.message)
      );
    }

    const populated = await result.populate('student', 'name rollNo department year email');
    return success(populated, 201);
  } catch (err) {
    return error(err.message);
  }
};
