import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
const emptySubject = { name: '', marks: '', grade: '' };

function Results() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSem, setFilterSem] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    student: '',
    semester: '',
    subjects: [{ ...emptySubject }],
  });
  const [computed, setComputed] = useState({ totalMarks: 0, percentage: 0, status: '-' });

  useEffect(() => {
    fetchResults();
    fetchStudents();
  }, []);

  const recalculate = useCallback((subjects) => {
    const validSubjects = subjects.filter((s) => s.marks !== '' && !isNaN(s.marks));
    if (validSubjects.length === 0) {
      setComputed({ totalMarks: 0, percentage: 0, status: '-' });
      return;
    }
    const totalMarks = validSubjects.reduce((sum, s) => sum + parseFloat(s.marks), 0);
    const percentage = parseFloat(((totalMarks / (validSubjects.length * 100)) * 100).toFixed(2));
    setComputed({ totalMarks, percentage, status: percentage >= 40 ? 'Pass' : 'Fail' });
  }, []);

  useEffect(() => {
    recalculate(form.subjects);
  }, [form.subjects, recalculate]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/results');
      setResults(data);
    } catch (err) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/students');
      setStudents(data);
    } catch (err) {
      toast.error('Failed to load students');
    }
  };

  const filtered = results.filter((r) => {
    const matchSem = !filterSem || r.semester === parseInt(filterSem);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSem && matchStatus;
  });

  const openAdd = () => {
    setEditId(null);
    setForm({ student: '', semester: '', subjects: [{ ...emptySubject }] });
    setShowModal(true);
  };

  const openEdit = (result) => {
    setEditId(result._id);
    setForm({
      student: result.student._id,
      semester: result.semester,
      subjects: result.subjects.map((s) => ({ name: s.name, marks: s.marks, grade: s.grade })),
    });
    setShowModal(true);
  };

  const addSubject = () => setForm({ ...form, subjects: [...form.subjects, { ...emptySubject }] });

  const removeSubject = (idx) => {
    if (form.subjects.length === 1) return;
    setForm({ ...form, subjects: form.subjects.filter((_, i) => i !== idx) });
  };

  const updateSubject = (idx, field, value) => {
    const updated = form.subjects.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setForm({ ...form, subjects: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student || !form.semester) {
      toast.error('Please select student and semester');
      return;
    }
    const invalidSubject = form.subjects.some((s) => !s.name || s.marks === '' || !s.grade);
    if (invalidSubject) {
      toast.error('Please fill in all subject fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, subjects: form.subjects.map((s) => ({ ...s, marks: Number(s.marks) })) };
      if (editId) {
        await API.put(`/results/${editId}`, payload);
        toast.success('Result updated successfully');
      } else {
        await API.post('/results', payload);
        toast.success('Result added successfully');
      }
      setShowModal(false);
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      await API.delete(`/results/${id}`);
      toast.success('Result deleted');
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Results</h2>
            <p className="text-gray-500 text-sm mt-1">{results.length} total results</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Result
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <select
            value={filterSem}
            onChange={(e) => setFilterSem(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading results...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No results found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Student</th>
                    <th className="px-6 py-3 text-left">Roll No</th>
                    <th className="px-6 py-3 text-left">Semester</th>
                    <th className="px-6 py-3 text-left">Total Marks</th>
                    <th className="px-6 py-3 text-left">Percentage</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r, i) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{r.student?.name}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono">{r.student?.rollNo}</td>
                      <td className="px-6 py-4 text-gray-600">Sem {r.semester}</td>
                      <td className="px-6 py-4 text-gray-600">{r.totalMarks}</td>
                      <td className="px-6 py-4 text-gray-600">{r.percentage}%</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            r.status === 'Pass'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {editId ? 'Edit Result' : 'Add Result'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select
                    value={form.student}
                    onChange={(e) => setForm({ ...form, student: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.rollNo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value ? parseInt(e.target.value) : '' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Semester</option>
                    {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Subjects</label>
                  <button
                    type="button"
                    onClick={addSubject}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    + Add Subject
                  </button>
                </div>
                <div className="space-y-2">
                  {form.subjects.map((subject, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => updateSubject(idx, 'name', e.target.value)}
                        placeholder="Subject name"
                        className="col-span-5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="number"
                        value={subject.marks}
                        onChange={(e) => updateSubject(idx, 'marks', e.target.value)}
                        placeholder="Marks (0-100)"
                        min="0"
                        max="100"
                        className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <select
                        value={subject.grade}
                        onChange={(e) => updateSubject(idx, 'grade', e.target.value)}
                        className="col-span-3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Grade</option>
                        {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSubject(idx)}
                        disabled={form.subjects.length === 1}
                        className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 text-lg font-bold text-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Computed Values */}
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Total Marks</p>
                  <p className="text-lg font-bold text-gray-800">{computed.totalMarks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="text-lg font-bold text-gray-800">{computed.percentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      computed.status === 'Pass'
                        ? 'bg-green-100 text-green-700'
                        : computed.status === 'Fail'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {computed.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {saving ? 'Saving...' : editId ? 'Update' : 'Add Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
