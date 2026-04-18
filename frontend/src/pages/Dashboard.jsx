import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import API from '../api/axios';

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6 flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalResults: 0,
    passCount: 0,
    failCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        API.get('/students'),
        API.get('/results'),
      ]);
      const results = resultsRes.data;
      setStats({
        totalStudents: studentsRes.data.length,
        totalResults: results.length,
        passCount: results.filter((r) => r.status === 'Pass').length,
        failCount: results.filter((r) => r.status === 'Fail').length,
      });
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const navCards = [
    {
      title: 'Manage Students',
      desc: 'Add, edit, or remove student records',
      link: '/students',
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      text: 'text-indigo-700',
      btn: 'bg-indigo-600 hover:bg-indigo-700',
    },
    {
      title: 'Manage Results',
      desc: 'Add, edit, or remove exam results',
      link: '/results',
      bg: 'bg-purple-50 hover:bg-purple-100',
      text: 'text-purple-700',
      btn: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Overview of the student result system</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon="🎓"
                color="border-indigo-500"
              />
              <StatCard
                title="Total Results"
                value={stats.totalResults}
                icon="📋"
                color="border-purple-500"
              />
              <StatCard
                title="Passed"
                value={stats.passCount}
                icon="✅"
                color="border-green-500"
                subtitle={`${stats.totalResults > 0 ? Math.round((stats.passCount / stats.totalResults) * 100) : 0}% pass rate`}
              />
              <StatCard
                title="Failed"
                value={stats.failCount}
                icon="❌"
                color="border-red-500"
                subtitle={`${stats.totalResults > 0 ? Math.round((stats.failCount / stats.totalResults) * 100) : 0}% fail rate`}
              />
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {navCards.map((card) => (
                <div key={card.link} className={`rounded-xl p-6 ${card.bg} transition-colors border border-transparent`}>
                  <h3 className={`text-lg font-semibold ${card.text} mb-2`}>{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{card.desc}</p>
                  <Link
                    to={card.link}
                    className={`inline-block ${card.btn} text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors`}
                  >
                    Go to {card.title.split(' ')[1]}
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
