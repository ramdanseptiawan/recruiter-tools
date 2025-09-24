'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock, Users, ChevronRight, FileText } from 'lucide-react';
import deepSeekService from '../lib/deepseek';

const jobListings = [
  {
    id: 1,
    title: 'Junior Data Analyst',
    company: 'TechCorp Indonesia',
    location: 'Jakarta, Indonesia',
    type: 'Full-time',
    salary: 'Rp 8,000,000 - 12,000,000',
    applicants: 24,
    posted: '2 hari yang lalu',
    description: 'Kami mencari Junior Data Analyst yang passionate untuk bergabung dengan tim data kami. Kandidat ideal memiliki pemahaman dasar tentang SQL, Python, dan visualisasi data.',
    requirements: [
      'Minimal S1 Statistik, Matematika, atau bidang terkait',
      'Pengalaman 1-2 tahun di bidang data analysis',
      'Menguasai SQL dan Python/R',
      'Familiar dengan tools visualisasi (Tableau, Power BI)',
      'Kemampuan komunikasi yang baik'
    ]
  },
  {
    id: 2,
    title: 'Product Engineer',
    company: 'StartupXYZ',
    location: 'Bandung, Indonesia',
    type: 'Full-time',
    salary: 'Rp 15,000,000 - 25,000,000',
    applicants: 18,
    posted: '1 hari yang lalu',
    description: 'Bergabunglah dengan tim engineering kami untuk membangun produk yang akan digunakan jutaan pengguna. Kami mencari engineer yang berpengalaman dalam full-stack development.',
    requirements: [
      'Minimal S1 Teknik Informatika atau bidang terkait',
      'Pengalaman 3+ tahun dalam software development',
      'Menguasai React.js, Node.js, dan database',
      'Pengalaman dengan cloud platforms (AWS/GCP)',
      'Mindset product-oriented dan user-centric'
    ]
  },
  {
    id: 3,
    title: 'GM Marketing',
    company: 'RetailMega',
    location: 'Surabaya, Indonesia',
    type: 'Full-time',
    salary: 'Rp 30,000,000 - 45,000,000',
    applicants: 12,
    posted: '3 hari yang lalu',
    description: 'Kami mencari General Manager Marketing yang berpengalaman untuk memimpin strategi pemasaran dan mengembangkan brand awareness di pasar Indonesia.',
    requirements: [
      'Minimal S1 Marketing, Business, atau bidang terkait',
      'Pengalaman 7+ tahun di bidang marketing, minimal 3 tahun di posisi managerial',
      'Pengalaman dalam digital marketing dan brand management',
      'Leadership skills yang kuat',
      'Pemahaman mendalam tentang pasar Indonesia'
    ]
  }
];

export default function Home() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApplication, setShowApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCvText, setParsedCvText] = useState('');
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    essay: '',
    cv: null
  });

  // Load PDF.js library
  const loadPDFJS = () => {
    return new Promise((resolve) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      document.head.appendChild(script);
    });
  };

  // Extract text from PDF page
  const extractTextFromPage = async (page) => {
    const textContent = await page.getTextContent();
    return textContent.items.map(item => item.str).join(' ');
  };

  // Parse PDF file client-side
  const parsePDFFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      return null;
    }

    setIsParsing(true);
    try {
      const pdfjsLib = await loadPDFJS();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const pageText = await extractTextFromPage(page);
        fullText += pageText + ' ';
      }

      const cleanText = fullText.trim();
      setParsedCvText(cleanText);
      return cleanText;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  const filteredJobs = jobListings.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowApplication(false);
  };

  const handleApplyClick = () => {
    setShowApplication(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate unique ID and create basic application object
      const applicationId = Date.now().toString();
      let candidateData = {
        id: applicationId,
        name: applicationData.name,
        email: applicationData.email,
        phone: applicationData.phone,
        position: selectedJob.title,
        company: selectedJob.company,
        appliedDate: new Date().toISOString(),
        essay: applicationData.essay,
        cvFileName: applicationData.cv ? applicationData.cv.name : null,
        location: 'Indonesia', // Default location
        education: 'S1', // Default education level
        experience: '2 tahun' // Default experience
      };

      // Use parsed CV text if available
      if (parsedCvText) {
        candidateData.cvText = parsedCvText;
      }

      // Analyze candidate using DeepSeek AI
      const aiAnalysis = await deepSeekService.analyzeCandidate(candidateData);
      
      // Create complete application with AI analysis
      const newApplication = {
        ...candidateData,
        ...aiAnalysis
      };

      // Calculate rank based on position
      const existingApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      const samePositionApplicants = existingApplications.filter(app => app.position === selectedJob.title);
      
      // Sort by AI score to determine rank
      const allApplicants = [...samePositionApplicants, newApplication].sort((a, b) => b.aiScore - a.aiScore);
      const newRank = allApplicants.findIndex(app => app.id === applicationId) + 1;
      
      newApplication.rank = newRank;
      
      // Update ranks for existing applicants of same position
      samePositionApplicants.forEach(applicant => {
        const updatedRank = allApplicants.findIndex(app => app.id === applicant.id) + 1;
        applicant.rank = updatedRank;
      });
      
      // Add new application
      existingApplications.push(newApplication);
      
      // Save back to localStorage
      localStorage.setItem('jobApplications', JSON.stringify(existingApplications));
      
      alert(`Aplikasi berhasil dikirim! 
      
AI Score: ${aiAnalysis.aiScore}/100
Ranking: #${newRank} untuk posisi ${selectedJob.title}

Tim HR akan menghubungi Anda dalam 3-5 hari kerja.`);
      
      setShowApplication(false);
      setSelectedJob(null);
      setApplicationData({ name: '', email: '', phone: '', essay: '', cv: null });
      
    } catch (error) {
      console.error('Error processing application:', error);
      alert('Terjadi kesalahan saat memproses aplikasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setApplicationData(prev => ({ ...prev, cv: file }));
    
    // Parse PDF immediately when uploaded
    if (file && file.type === 'application/pdf') {
      await parsePDFFile(file);
    } else {
      setParsedCvText('');
    }
  };

  if (selectedJob && showApplication) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowApplication(false)}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali ke Detail Lowongan
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Lamar untuk {selectedJob.title}
            </h1>
            <p className="text-gray-600 mb-6">{selectedJob.company}</p>

            <form onSubmit={handleApplicationSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={applicationData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={applicationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  required
                  value={applicationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CV *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Format: PDF, DOC, DOCX (Max 5MB)</p>
                
                {/* PDF Parsing Status */}
                {isParsing && (
                  <div className="mt-2 flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm">Memproses PDF...</span>
                  </div>
                )}
                
                {parsedCvText && !isParsing && (
                  <div className="mt-2 flex items-center text-green-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm">PDF berhasil diproses ({parsedCvText.length} karakter)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Essay Motivasi *
                </label>
                <textarea
                  required
                  rows={6}
                  value={applicationData.essay}
                  onChange={(e) => handleInputChange('essay', e.target.value)}
                  placeholder="Ceritakan mengapa Anda tertarik dengan posisi ini dan bagaimana pengalaman Anda relevan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Memproses dengan AI...</span>
                  </div>
                ) : (
                  'Kirim Aplikasi'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedJob(null)}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Kembali ke Daftar Lowongan
          </button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedJob.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{selectedJob.company}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedJob.type}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedJob.applicants} pelamar
                </div>
              </div>
              
              <div className="mt-4">
                <span className="text-2xl font-bold text-green-600">{selectedJob.salary}</span>
                <span className="text-gray-500 ml-2">per bulan</span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Deskripsi Pekerjaan</h2>
                <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Persyaratan</h2>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleApplyClick}
                className="w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Lamar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recruitment Tools</h1>
              <p className="text-gray-600 mt-1">Temukan karir impian Anda</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                HR Dashboard
              </a>
              <span className="text-sm text-gray-500">
                {filteredJobs.length} lowongan tersedia
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari posisi atau perusahaan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Job Listings */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {job.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                
                <p className="text-gray-600 font-medium mb-3">{job.company}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {job.applicants} pelamar
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-lg font-semibold text-green-600">{job.salary}</p>
                  <p className="text-sm text-gray-500 mt-1">{job.posted}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Tidak ada lowongan yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
