import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Other'];
const YEARS = [1, 2, 3, 4, 5];
const AVATAR_COLORS = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];

const emptyForm = { name: '', rollNo: '', department: '', year: '' };

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name = '') {
  let sum = 0;
  for (const c of name) sum += c.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function StudentAvatar({ student, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-10 h-10 text-sm';
  if (student.photoUrl) {
    return (
      <img
        src={student.photoUrl}
        alt={student.name}
        className={`${dim} rounded-full object-cover ring-2 ring-white`}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full ${avatarColor(student.name)} flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {getInitials(student.name)}
    </div>
  );
}

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/students');
      setStudents(data);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase());
    const matchDept = !filterDept || s.department === filterDept;
    const matchYear = !filterYear || s.year === parseInt(filterYear);
    return matchSearch && matchDept && matchYear;
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setPhotoPreview('');
    setShowModal(true);
  };

  const openEdit = (student) => {
    setEditId(student._id);
    setForm({ name: student.name, rollNo: student.rollNo, department: student.department, year: student.year });
    setPhotoFile(null);
    setPhotoPreview(student.photoUrl || '');
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPEG, PNG or WebP allowed'); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (studentId) => {
    if (!photoFile) return null;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(photoFile);
      });
      const { data } = await API.post('/upload/photo', { fileData: base64, fileType: photoFile.type, studentId });
      return data.photoUrl;
    } catch (err) {
      toast.error('Photo upload failed — student saved without photo');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rollNo || !form.department || !form.year) {
      toast.error('All fields are required');
      return;
    }
    setSaving(true);
    try {
      let savedStudent;
      if (editId) {
        const { data } = await API.put(`/students/${editId}`, form);
        savedStudent = data;
        toast.success('Student updated successfully');
      } else {
        const { data } = await API.post('/students', form);
        savedStudent = data;
        toast.success('Student added successfully');
      }

      if (photoFile) {
        const photoUrl = await uploadPhoto(savedStudent._id);
        if (photoUrl) {
          await API.put(`/students/${savedStudent._id}`, { ...form, photoUrl });
        }
      }

      setShowModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await API.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
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
            <h2 className="text-2xl font-bold text-gray-800">Students</h2>
            <p className="text-gray-500 text-sm mt-1">{students.length} total students</p>
          </div>
          <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text" placeholder="Search by name or roll number..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No students found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Photo</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Roll No</th>
                    <th className="px-6 py-3 text-left">Department</th>
                    <th className="px-6 py-3 text-left">Year</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s, i) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-3">
                        <StudentAvatar student={s} size="sm" />
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-800">{s.name}</td>
                      <td className="px-6 py-3 text-gray-600 font-mono">{s.rollNo}</td>
                      <td className="px-6 py-3 text-gray-600">{s.department}</td>
                      <td className="px-6 py-3 text-gray-600">Year {s.year}</td>
                      <td className="px-6 py-3 flex gap-2">
                        <button onClick={() => openEdit(s)}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-xs font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(s._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-xs font-medium transition-colors">
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>

            {/* Photo Upload */}
            <div className="flex flex-col items-center mb-5">
              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-100" />
                ) : (
                  <div className={`w-24 h-24 rounded-full ${form.name ? avatarColor(form.name) : 'bg-gray-200'} flex items-center justify-center`}>
                    <span className="text-2xl font-bold text-white">{form.name ? getInitials(form.name) : '?'}</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={handlePhotoChange} />
              <p className="text-xs text-gray-400 mt-2">Click to upload photo (max 2MB)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter student name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input type="text" value={form.rollNo}
                  onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                  placeholder="e.g. CS2021001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : '' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Year</option>
                  {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploadingPhoto}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  {saving || uploadingPhoto ? 'Saving...' : editId ? 'Update' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
