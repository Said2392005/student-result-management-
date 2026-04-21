import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const API_BASE = 'https://lxfzv4qqta.execute-api.ap-south-1.amazonaws.com/prod';
const S3_CONSOLE = 'https://s3.console.aws.amazon.com/s3/buckets/student-result-photos-prod';
const APIGW_CONSOLE = 'https://ap-south-1.console.aws.amazon.com/apigateway';

const AVATAR_COLORS = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name = '') {
  let sum = 0;
  for (const c of name) sum += c.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const ENDPOINTS = [
  { method: 'POST',   path: '/auth/login',       desc: 'Admin Login',           auth: false },
  { method: 'POST',   path: '/auth/register',    desc: 'Create Admin',          auth: false },
  { method: 'GET',    path: '/students',         desc: 'Get All Students',      auth: true  },
  { method: 'POST',   path: '/students',         desc: 'Add Student',           auth: true  },
  { method: 'PUT',    path: '/students/{id}',    desc: 'Update Student',        auth: true  },
  { method: 'DELETE', path: '/students/{id}',    desc: 'Delete Student',        auth: true  },
  { method: 'GET',    path: '/results',          desc: 'Get All Results',       auth: true  },
  { method: 'POST',   path: '/results',          desc: 'Add Result + Email',    auth: true  },
  { method: 'PUT',    path: '/results/{id}',     desc: 'Update Result',         auth: true  },
  { method: 'DELETE', path: '/results/{id}',     desc: 'Delete Result',         auth: true  },
  { method: 'POST',   path: '/upload/photo',     desc: 'Upload to S3',          auth: true  },
  { method: 'GET',    path: '/health',           desc: 'API Health Check',      auth: false },
];

const METHOD_COLORS = {
  GET:    'bg-blue-100 text-blue-700',
  POST:   'bg-green-100 text-green-700',
  PUT:    'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

function MethodBadge({ method }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${METHOD_COLORS[method] || 'bg-gray-100 text-gray-600'}`}>
      {method}
    </span>
  );
}

function Media() {
  const [students, setStudents] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    API.get('/students')
      .then(({ data }) => setStudents(data))
      .catch(() => toast.error('Failed to load students'));
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPEG, PNG or WebP allowed'); return; }
    setPhotoFile(file);
    setUploadedUrl('');
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const fetchStudents = () =>
    API.get('/students').then(({ data }) => setStudents(data)).catch(() => {});

  const handleUpload = async () => {
    if (!photoFile) { toast.error('Please select a photo first'); return; }
    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });

      const { data } = await API.post('/upload/photo', {
        fileData: base64,
        fileType: photoFile.type,
        studentId: selectedStudent || null,
      });

      const { photoUrl } = data;
      setUploadedUrl(photoUrl);

      if (selectedStudent && photoUrl) {
        await API.put(`/students/${selectedStudent}`, { photoUrl });
        await fetchStudents();
      }

      toast.success('Photo uploaded to S3 successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const studentsWithPhotos = students.filter((s) => s.photoUrl);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Section 1: Upload Photo ── */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">Upload Photo to S3</h2>
            <p className="text-gray-500 text-sm mt-1">Upload a student profile photo to AWS S3</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Drop zone */}
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-dashed border-2 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px]
                  ${dragging ? 'border-purple-400 bg-purple-50' : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'}`}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-200 mb-3" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <p className="text-sm text-gray-600 font-medium">
                  {photoFile ? photoFile.name : 'Drag & drop or click to select'}
                </p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 2MB</p>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col justify-between gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Student (optional)</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">— No student —</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNo})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !photoFile}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Uploading to S3...
                  </>
                ) : 'Upload to S3'}
              </button>

              {uploadedUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Upload successful!
                  </div>
                  <img src={uploadedUrl} alt="Uploaded" className="w-16 h-16 rounded-full object-cover ring-2 ring-green-300" />
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer"
                    className="block text-xs text-blue-600 hover:underline break-all">
                    {uploadedUrl}
                  </a>
                  <a href={S3_CONSOLE} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors">
                    <span>View in S3 Console</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Section 2: S3 Gallery ── */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Student Photos in AWS S3</h2>
              <p className="text-gray-500 text-sm mt-1">
                {studentsWithPhotos.length} photo{studentsWithPhotos.length !== 1 ? 's' : ''} stored in S3
              </p>
            </div>
            <a href={S3_CONSOLE} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open S3 Bucket
            </a>
          </div>

          {studentsWithPhotos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No student photos yet. Upload one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {students.map((s) => (
                <div key={s._id} className="flex flex-col items-center bg-gray-50 hover:bg-purple-50 rounded-xl p-4 transition-colors border border-transparent hover:border-purple-200">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name}
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-200 mb-3"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`w-20 h-20 rounded-full ${avatarColor(s.name)} flex items-center justify-center mb-3 font-bold text-white text-xl ${s.photoUrl ? 'hidden' : 'flex'}`}>
                    {getInitials(s.name)}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 text-center truncate w-full text-center">{s.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{s.rollNo}</p>
                  {s.photoUrl && (
                    <span className="mt-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">S3</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Section 3: API Explorer ── */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">AWS API Gateway — Live Endpoints</h2>
              <p className="text-gray-500 text-sm mt-1">All 12 REST endpoints deployed on AWS</p>
            </div>
            <a href={APIGW_CONSOLE} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open API Gateway Console
            </a>
          </div>

          {/* Base URL */}
          <div className="bg-gray-900 rounded-lg px-4 py-3 mb-5 flex items-center justify-between gap-3 flex-wrap">
            <code className="text-green-400 text-sm break-all">{API_BASE}</code>
            <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>

          {/* Endpoints table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Endpoint</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Auth</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ENDPOINTS.map((ep, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <MethodBadge method={ep.method} />
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-gray-700 font-mono text-xs">{ep.path}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ep.desc}</td>
                    <td className="px-4 py-3">
                      {ep.auth ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">JWT</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-semibold">Public</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`${API_BASE}${ep.path.replace(/{id}/g, 'test')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      >
                        Test
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Media;
