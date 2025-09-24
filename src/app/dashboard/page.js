'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Award, 
  Search, 
  Filter,
  Download,
  Eye,
  Star,
  MapPin,
  Calendar,
  GraduationCap,
  X,
  Brain,
  Zap,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import storageManager from '../../lib/storage';

// Mock data for applicants
const applicantsData = [
  {
    id: 1,
    name: 'Ahmad Rizki Pratama',
    email: 'ahmad.rizki@email.com',
    phone: '081234567890',
    position: 'Junior Data Analyst',
    appliedDate: '2024-01-15',
    education: 'S1 Statistik - Universitas Indonesia',
    experience: '2 tahun',
    location: 'Jakarta',
    aiScore: 85,
    rank: 3,
    skills: {
      technical: 8,
      communication: 7,
      problemSolving: 9,
      experience: 6,
      education: 8
    },
    aiAnalysis: {
      strengths: ['Strong analytical skills', 'Good Python knowledge', 'Relevant education background'],
      weaknesses: ['Limited industry experience', 'Could improve presentation skills'],
      recommendation: 'Recommended for interview - shows strong potential'
    }
  },
  {
    id: 2,
    name: 'Sari Dewi Lestari',
    email: 'sari.dewi@email.com',
    phone: '081234567891',
    position: 'Product Engineer',
    appliedDate: '2024-01-14',
    education: 'S1 Teknik Informatika - ITB',
    experience: '4 tahun',
    location: 'Bandung',
    aiScore: 92,
    rank: 1,
    skills: {
      technical: 9,
      communication: 8,
      problemSolving: 9,
      experience: 8,
      education: 9
    },
    aiAnalysis: {
      strengths: ['Excellent technical skills', 'Strong problem-solving ability', 'Good team collaboration'],
      weaknesses: ['Could expand leadership experience'],
      recommendation: 'Highly recommended - top candidate'
    }
  },
  {
    id: 3,
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    phone: '081234567892',
    position: 'GM Marketing',
    appliedDate: '2024-01-13',
    education: 'S1 Marketing - Universitas Gadjah Mada',
    experience: '8 tahun',
    location: 'Yogyakarta',
    aiScore: 78,
    rank: 2,
    skills: {
      technical: 6,
      communication: 9,
      problemSolving: 7,
      experience: 8,
      education: 7
    },
    aiAnalysis: {
      strengths: ['Excellent communication skills', 'Extensive marketing experience'],
      weaknesses: ['Limited digital marketing experience', 'Lacks leadership in large teams'],
      recommendation: 'Not recommended for GM level - better fit for senior marketing role'
    }
  },
  {
    id: 4,
    name: 'Maya Putri Indah',
    email: 'maya.putri@email.com',
    phone: '081234567893',
    position: 'Junior Data Analyst',
    appliedDate: '2024-01-12',
    education: 'S1 Matematika - Universitas Brawijaya',
    experience: '1 tahun',
    location: 'Malang',
    aiScore: 88,
    rank: 2,
    skills: {
      technical: 8,
      communication: 8,
      problemSolving: 9,
      experience: 5,
      education: 9
    },
    aiAnalysis: {
      strengths: ['Strong mathematical foundation', 'Quick learner', 'Good analytical thinking'],
      weaknesses: ['Limited work experience', 'Needs more exposure to business context'],
      recommendation: 'Recommended - high potential junior candidate'
    }
  },
  {
    id: 5,
    name: 'Andi Wijaya',
    email: 'andi.wijaya@email.com',
    phone: '081234567894',
    position: 'Product Engineer',
    appliedDate: '2024-01-11',
    education: 'S1 Sistem Informasi - Binus University',
    experience: '3 tahun',
    location: 'Jakarta',
    aiScore: 81,
    rank: 3,
    skills: {
      technical: 7,
      communication: 7,
      problemSolving: 8,
      experience: 7,
      education: 7
    },
    aiAnalysis: {
      strengths: ['Good full-stack development skills', 'Team player'],
      weaknesses: ['Needs improvement in system design', 'Limited experience with large-scale systems'],
      recommendation: 'Consider for interview - solid mid-level candidate'
    }
  },
  {
    id: 6,
    name: 'Indira Sari Putri',
    email: 'indira.sari@email.com',
    phone: '081234567895',
    position: 'Junior Data Analyst',
    appliedDate: '2024-01-10',
    education: 'S1 Ilmu Komputer - Universitas Gadjah Mada',
    experience: '1.5 tahun',
    location: 'Yogyakarta',
    aiScore: 82,
    rank: 4,
    skills: {
      technical: 7,
      communication: 8,
      problemSolving: 8,
      experience: 5,
      education: 8
    },
    aiAnalysis: {
      strengths: ['Good programming skills', 'Strong academic background', 'Fast learner'],
      weaknesses: ['Limited real-world project experience', 'Needs improvement in data visualization'],
      recommendation: 'Consider for interview - promising junior candidate'
    }
  },
  {
    id: 7,
    name: 'Reza Firmansyah',
    email: 'reza.firmansyah@email.com',
    phone: '081234567896',
    position: 'Product Engineer',
    appliedDate: '2024-01-09',
    education: 'S1 Teknik Komputer - Universitas Indonesia',
    experience: '5 tahun',
    location: 'Jakarta',
    aiScore: 89,
    rank: 2,
    skills: {
      technical: 9,
      communication: 7,
      problemSolving: 9,
      experience: 8,
      education: 8
    },
    aiAnalysis: {
      strengths: ['Excellent backend development', 'Strong system architecture knowledge', 'Good problem-solving skills'],
      weaknesses: ['Limited frontend experience', 'Could improve communication with non-technical stakeholders'],
      recommendation: 'Recommended - strong technical candidate'
    }
  },
  {
    id: 8,
    name: 'Diana Maharani',
    email: 'diana.maharani@email.com',
    phone: '081234567897',
    position: 'GM Marketing',
    appliedDate: '2024-01-08',
    education: 'S2 MBA Marketing - Universitas Indonesia',
    experience: '10 tahun',
    location: 'Jakarta',
    aiScore: 94,
    rank: 1,
    skills: {
      technical: 7,
      communication: 10,
      problemSolving: 9,
      experience: 10,
      education: 9
    },
    aiAnalysis: {
      strengths: ['Outstanding leadership experience', 'Proven track record in brand management', 'Excellent strategic thinking'],
      weaknesses: ['Could improve technical marketing tools knowledge'],
      recommendation: 'Highly recommended - ideal GM candidate'
    }
  },
  {
    id: 9,
    name: 'Fajar Nugroho',
    email: 'fajar.nugroho@email.com',
    phone: '081234567898',
    position: 'Junior Data Analyst',
    appliedDate: '2024-01-07',
    education: 'S1 Matematika - Institut Teknologi Sepuluh Nopember',
    experience: '6 bulan',
    location: 'Surabaya',
    aiScore: 76,
    rank: 5,
    skills: {
      technical: 6,
      communication: 6,
      problemSolving: 8,
      experience: 4,
      education: 8
    },
    aiAnalysis: {
      strengths: ['Strong mathematical foundation', 'Good analytical thinking', 'Eager to learn'],
      weaknesses: ['Very limited work experience', 'Needs improvement in programming skills', 'Lacks business understanding'],
      recommendation: 'Consider for internship or entry-level position with mentoring'
    }
  },
  {
    id: 10,
    name: 'Lestari Wulandari',
    email: 'lestari.wulandari@email.com',
    phone: '081234567899',
    position: 'Product Engineer',
    appliedDate: '2024-01-06',
    education: 'S1 Teknik Informatika - Universitas Brawijaya',
    experience: '2 tahun',
    location: 'Malang',
    aiScore: 78,
    rank: 5,
    skills: {
      technical: 6,
      communication: 7,
      problemSolving: 7,
      experience: 6,
      education: 7
    },
    aiAnalysis: {
      strengths: ['Good foundation in web development', 'Team collaboration skills', 'Willing to learn new technologies'],
      weaknesses: ['Limited experience with complex systems', 'Needs improvement in testing practices', 'Lacks mobile development experience'],
      recommendation: 'Consider for junior position with proper guidance'
    }
  },
  {
    id: 11,
    name: 'Arief Budiman',
    email: 'arief.budiman@email.com',
    phone: '081234567800',
    position: 'GM Marketing',
    appliedDate: '2024-01-05',
    education: 'S1 Komunikasi - Universitas Padjadjaran',
    experience: '6 tahun',
    location: 'Bandung',
    aiScore: 72,
    rank: 3,
    skills: {
      technical: 5,
      communication: 8,
      problemSolving: 6,
      experience: 7,
      education: 6
    },
    aiAnalysis: {
      strengths: ['Good communication skills', 'Creative thinking', 'Understanding of local market'],
      weaknesses: ['Limited managerial experience', 'Lacks digital marketing expertise', 'No experience with large teams'],
      recommendation: 'Not suitable for GM level - better fit for marketing manager role'
    }
  },
  {
    id: 12,
    name: 'Putri Ayu Lestari',
    email: 'putri.ayu@email.com',
    phone: '081234567801',
    position: 'Product Engineer',
    appliedDate: '2024-01-04',
    education: 'S1 Teknik Informatika - Universitas Diponegoro',
    experience: '3.5 tahun',
    location: 'Semarang',
    aiScore: 86,
    rank: 4,
    skills: {
      technical: 8,
      communication: 8,
      problemSolving: 8,
      experience: 7,
      education: 8
    },
    aiAnalysis: {
      strengths: ['Well-rounded technical skills', 'Good communication abilities', 'Experience with agile methodologies'],
      weaknesses: ['Limited experience with microservices', 'Could improve DevOps knowledge'],
      recommendation: 'Recommended - solid mid-level engineer'
    }
  },
  {
    id: 13,
    name: 'Dimas Prasetyo',
    email: 'dimas.prasetyo@email.com',
    phone: '081234567802',
    position: 'Junior Data Analyst',
    appliedDate: '2024-01-03',
    education: 'S1 Statistik - Universitas Brawijaya',
    experience: '3 tahun',
    location: 'Malang',
    aiScore: 90,
    rank: 1,
    skills: {
      technical: 9,
      communication: 8,
      problemSolving: 9,
      experience: 7,
      education: 8
    },
    aiAnalysis: {
      strengths: ['Excellent statistical knowledge', 'Strong Python and R skills', 'Good data visualization abilities'],
      weaknesses: ['Could improve business communication', 'Limited experience with big data tools'],
      recommendation: 'Highly recommended - top junior analyst candidate'
    }
  }
];

// Position statistics
const positionStats = [
  { position: 'Junior Data Analyst', applicants: 24, hired: 2 },
  { position: 'Product Engineer', applicants: 18, hired: 0 },
  { position: 'GM Marketing', applicants: 12, hired: 0 }
];

const educationStats = [
  { name: 'S1 Teknik Informatika', value: 35, color: '#3B82F6' },
  { name: 'S1 Statistik/Matematika', value: 25, color: '#10B981' },
  { name: 'S1 Marketing/Business', value: 20, color: '#F59E0B' },
  { name: 'Lainnya', value: 20, color: '#EF4444' }
];

const statusColors = {
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'Interview Scheduled': 'bg-blue-100 text-blue-800',
  'Hired': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800'
};

export default function Dashboard() {
  const [applicants, setApplicants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedPositionForComparison, setSelectedPositionForComparison] = useState(null);
  const [showPositionComparison, setShowPositionComparison] = useState(false);

  // Load data on component mount
  useEffect(() => {
    // Load applications from storage manager
    const loadApplications = () => {
      try {
        // Get applications from enhanced storage
        const savedApplications = storageManager.getApplications();
        
        if (savedApplications.length > 0) {
          // Merge with mock data, prioritizing saved data
          const merged = [...applicantsData];
          savedApplications.forEach(saved => {
            const existingIndex = merged.findIndex(app => app.id === saved.id);
            if (existingIndex >= 0) {
              merged[existingIndex] = saved;
            } else {
              merged.push(saved);
            }
          });
          
          // Recalculate rankings for all positions after merge
          const positions = [...new Set(merged.map(app => app.position))];
          positions.forEach(position => {
            const positionApplicants = merged.filter(app => app.position === position);
            
            // Sort berdasarkan AI Score (tertinggi ke terendah), kemudian berdasarkan tanggal aplikasi (terlama dulu)
            positionApplicants.sort((a, b) => {
              if (b.aiScore !== a.aiScore) {
                return b.aiScore - a.aiScore; // Sort by score descending
              }
              // Jika score sama, yang apply lebih dulu mendapat ranking lebih tinggi
              return new Date(a.appliedDate) - new Date(b.appliedDate);
            });
            
            // Update ranking dengan menangani skor yang sama
            let currentRank = 1;
            positionApplicants.forEach((applicant, index) => {
              if (index > 0 && applicant.aiScore < positionApplicants[index - 1].aiScore) {
                currentRank = index + 1;
              }
              applicant.rank = currentRank;
            });
          });
          
          setApplicants(merged);
        } else {
          setApplicants(applicantsData);
        }
        
        // Clean expired AI cache
        storageManager.cleanExpiredCache();
        
      } catch (error) {
        console.error('Error loading applications:', error);
        setApplicants(applicantsData);
      }
    };

    loadApplications();
    
    // Set up periodic cache cleanup (every 5 minutes)
    const cleanupInterval = setInterval(() => {
      storageManager.cleanExpiredCache();
    }, 5 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Get candidates by position
  const getCandidatesByPosition = (position) => {
    return applicants.filter(candidate => candidate.position === position);
  };

  // Handle position comparison
  const handlePositionComparison = (position) => {
    setSelectedPositionForComparison(position);
    setShowPositionComparison(true);
    // Scroll to comparison section
    setTimeout(() => {
      document.getElementById('comparison-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Get unique positions
  const getUniquePositions = () => {
    return [...new Set(applicants.map(app => app.position))];
  };

  // Filter applicants based on search and position filter
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === '' || applicant.position === filterPosition;
    return matchesSearch && matchesPosition;
  });

  // Comparison Radar Chart Component
  const ComparisonRadarChart = ({ candidates }) => {
    const data = [
      { skill: 'Technical', ...candidates.reduce((acc, candidate, index) => ({ ...acc, [`candidate${index}`]: candidate.skills.technical }), {}) },
      { skill: 'Communication', ...candidates.reduce((acc, candidate, index) => ({ ...acc, [`candidate${index}`]: candidate.skills.communication }), {}) },
      { skill: 'Problem Solving', ...candidates.reduce((acc, candidate, index) => ({ ...acc, [`candidate${index}`]: candidate.skills.problemSolving }), {}) },
      { skill: 'Experience', ...candidates.reduce((acc, candidate, index) => ({ ...acc, [`candidate${index}`]: candidate.skills.experience }), {}) },
      { skill: 'Education', ...candidates.reduce((acc, candidate, index) => ({ ...acc, [`candidate${index}`]: candidate.skills.education }), {}) }
    ];

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} />
          {candidates.map((candidate, index) => (
            <Radar
              key={candidate.id}
              name={candidate.name}
              dataKey={`candidate${index}`}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // Show applicant detail modal
  if (selectedApplicant) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedApplicant.name}</h2>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pribadi</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {selectedApplicant.email}</p>
                  <p><span className="font-medium">Telepon:</span> {selectedApplicant.phone}</p>
                  <p><span className="font-medium">Posisi:</span> {selectedApplicant.position}</p>
                  <p><span className="font-medium">Lokasi:</span> {selectedApplicant.location}</p>
                  <p><span className="font-medium">Tanggal Apply:</span> {new Date(selectedApplicant.appliedDate).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Kualifikasi</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Pendidikan:</span> {selectedApplicant.education}</p>
                  <p><span className="font-medium">Pengalaman:</span> {selectedApplicant.experience}</p>
                  <p><span className="font-medium">AI Score:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                      selectedApplicant.aiScore >= 90 ? 'bg-green-100 text-green-800' :
                      selectedApplicant.aiScore >= 80 ? 'bg-blue-100 text-blue-800' :
                      selectedApplicant.aiScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedApplicant.aiScore}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Assessment</h3>
              
              {/* Radar Chart */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3 text-center">Skills Radar Chart</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { skill: 'Technical', value: selectedApplicant.skills.technical },
                      { skill: 'Communication', value: selectedApplicant.skills.communication },
                      { skill: 'Problem Solving', value: selectedApplicant.skills.problemSolving },
                      { skill: 'Experience', value: selectedApplicant.skills.experience },
                      { skill: 'Education', value: selectedApplicant.skills.education }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 10]} 
                        tick={{ fontSize: 10 }}
                        tickCount={6}
                      />
                      <Radar
                        name="Skills"
                        dataKey="value"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}/10`, 'Score']}
                        labelFormatter={(label) => `${label}`}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills Bar Chart */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-800 mb-3">Detailed Skills Breakdown</h4>
                {Object.entries(selectedApplicant.skills).map(([skill, value]) => (
                  <div key={skill} className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-700 capitalize">{skill}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(value / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{value}/10</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Strengths:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedApplicant.aiAnalysis.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Areas for Improvement:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedApplicant.aiAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Recommendation:</h4>
                  <p className="text-blue-800">{selectedApplicant.aiAnalysis.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Position-based Comparison Section */}
        {showPositionComparison && selectedPositionForComparison && (
          <div className="space-y-6 mb-8" id="comparison-section">
            {/* Comparison Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Perbandingan Kandidat - {selectedPositionForComparison}</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Membandingkan {getCandidatesByPosition(selectedPositionForComparison).length} kandidat untuk posisi ini
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPositionComparison(false);
                    setSelectedPositionForComparison(null);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Tutup Perbandingan
                </button>
              </div>
            </div>

            {(() => {
              const positionCandidates = getCandidatesByPosition(selectedPositionForComparison);
              
              return (
                <>
                  {/* Quick Stats */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistik Cepat</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-green-800 font-medium text-sm">AI Score Tertinggi</div>
                        <div className="text-green-900 font-bold text-lg mt-1">
                          {positionCandidates.reduce((best, candidate) => 
                            candidate.aiScore > best.aiScore ? candidate : best
                          ).name}
                        </div>
                        <div className="text-green-700 text-sm">
                          Score: {positionCandidates.reduce((best, candidate) => 
                            candidate.aiScore > best.aiScore ? candidate : best
                          ).aiScore}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-blue-800 font-medium text-sm">Pendidikan Terbaik</div>
                        <div className="text-blue-900 font-bold text-lg mt-1">
                          {positionCandidates.reduce((best, candidate) => 
                            candidate.skills.education > best.skills.education ? candidate : best
                          ).name}
                        </div>
                        <div className="text-blue-700 text-sm">
                          {positionCandidates.reduce((best, candidate) => 
                            candidate.skills.education > best.skills.education ? candidate : best
                          ).education}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-purple-800 font-medium text-sm">Pengalaman Terbanyak</div>
                        <div className="text-purple-900 font-bold text-lg mt-1">
                          {positionCandidates.reduce((best, candidate) => {
                            const currentExp = parseInt(candidate.experience.split(' ')[0]) || 0;
                            const bestExp = parseInt(best.experience.split(' ')[0]) || 0;
                            return currentExp > bestExp ? candidate : best;
                          }).name}
                        </div>
                        <div className="text-purple-700 text-sm">
                          {positionCandidates.reduce((best, candidate) => {
                            const currentExp = parseInt(candidate.experience.split(' ')[0]) || 0;
                            const bestExp = parseInt(best.experience.split(' ')[0]) || 0;
                            return currentExp > bestExp ? candidate : best;
                          }).experience}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side Detailed Comparison */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Detail</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {positionCandidates.map((candidate, index) => (
                        <div key={candidate.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5 relative">
                          {/* Rank Badge */}
                          <div className="absolute -top-2 -right-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              candidate.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                              candidate.rank === 2 ? 'bg-gray-300 text-gray-800' :
                              'bg-orange-300 text-orange-800'
                            }`}>
                              #{candidate.rank}
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 text-lg">{candidate.name}</h5>
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                            <div className="flex items-center mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                candidate.aiScore >= 90 ? 'bg-green-100 text-green-800' :
                                candidate.aiScore >= 80 ? 'bg-blue-100 text-blue-800' :
                                candidate.aiScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                AI Score: {candidate.aiScore}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pendidikan</span>
                              <p className="text-sm text-gray-900 mt-1">{candidate.education}</p>
                            </div>
                            
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pengalaman</span>
                              <p className="text-sm text-gray-900 mt-1">{candidate.experience}</p>
                            </div>
                            
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</span>
                              <p className="text-sm text-gray-900 mt-1 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {candidate.location}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Apply</span>
                              <p className="text-sm text-gray-900 mt-1 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(candidate.appliedDate).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          
                          {/* Skills Mini Chart */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Skills Overview</span>
                            <div className="mt-2 space-y-2">
                              {Object.entries(candidate.skills).map(([skill, value]) => (
                                <div key={skill} className="flex items-center">
                                  <span className="text-xs text-gray-600 w-20 capitalize">{skill}</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${(value / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 ml-2">{value}/10</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* AI Analysis */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI Analysis</span>
                            <div className="mt-2">
                              <div className="mb-2">
                                <span className="text-xs font-medium text-green-700">Strengths:</span>
                                <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                  {candidate.aiAnalysis.strengths.slice(0, 2).map((strength, idx) => (
                                    <li key={idx}>{strength}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="mb-2">
                                <span className="text-xs font-medium text-red-700">Areas for Improvement:</span>
                                <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                                  {candidate.aiAnalysis.weaknesses.slice(0, 2).map((weakness, idx) => (
                                    <li key={idx}>{weakness}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-blue-700">Recommendation:</span>
                                <p className="text-xs text-gray-600 mt-1">{candidate.aiAnalysis.recommendation}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Radar Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Skills - Radar Chart</h4>
                    <ComparisonRadarChart candidates={positionCandidates} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setShowPositionComparison(false);
                        setSelectedPositionForComparison(null);
                      }}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Tutup Perbandingan
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Main Dashboard Content */}
        {!showPositionComparison && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Smart Recruiter Dashboard</h1>
              <p className="mt-2 text-gray-600">Kelola dan analisis kandidat dengan AI-powered insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Aplikasi</p>
                    <p className="text-2xl font-semibold text-gray-900">{applicants.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">AI Analyzed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {applicants.filter(app => app.aiScore && app.aiAnalysis).length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      <Zap className="w-3 h-3 inline mr-1" />
                      Real-time AI
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg AI Score</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {applicants.length > 0 ? 
                        Math.round(applicants.reduce((sum, app) => sum + (app.aiScore || 0), 0) / applicants.length) 
                        : 0}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Updated live
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Top Scorer</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {applicants.length > 0 ? 
                        applicants.reduce((best, app) => app.aiScore > best.aiScore ? app : best, applicants[0])?.aiScore || 0
                        : 0}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {applicants.length > 0 ? 
                        applicants.reduce((best, app) => app.aiScore > best.aiScore ? app : best, applicants[0])?.name?.split(' ')[0] || 'N/A'
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {storageManager.getStorageSize().totalKB}KB
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Local cache
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Applications by Position */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Position</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={positionStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applicants" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Education Background */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Education Background</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={educationStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {educationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Position-based Comparison Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Kandidat per Posisi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getUniquePositions().map(position => {
                  const candidateCount = getCandidatesByPosition(position).length;
                  return (
                    <div key={position} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{position}</h4>
                      <p className="text-sm text-gray-600 mb-3">{candidateCount} kandidat</p>
                      {candidateCount >= 2 ? (
                        <button
                          onClick={() => handlePositionComparison(position)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Bandingkan Kandidat
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed"
                        >
                          Minimal 2 kandidat
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari kandidat..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sm:w-64">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                    >
                      <option value="">Semua Posisi</option>
                      {getUniquePositions().map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Kandidat</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kandidat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posisi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AI Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pengalaman
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lokasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {applicant.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                              <div className="text-sm text-gray-500">{applicant.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            applicant.rank === 1 ? 'bg-blue-100 text-blue-800' :
                            applicant.rank === 2 ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            #{applicant.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {applicant.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            applicant.aiScore >= 90 ? 'bg-green-100 text-green-800' :
                            applicant.aiScore >= 80 ? 'bg-blue-100 text-blue-800' :
                            applicant.aiScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {applicant.aiScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {applicant.experience}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {applicant.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedApplicant(applicant)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}