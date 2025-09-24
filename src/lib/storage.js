/**
 * Local Storage Management untuk Smart Recruiter
 * Mengelola penyimpanan data aplikasi dan hasil AI analysis
 */

class StorageManager {
  constructor() {
    this.APPLICATIONS_KEY = 'jobApplications';
    this.AI_CACHE_KEY = 'aiAnalysisCache';
    this.SETTINGS_KEY = 'appSettings';
  }

  /**
   * Menyimpan aplikasi baru dengan AI analysis
   */
  saveApplication(applicationData) {
    try {
      const applications = this.getApplications();
      
      // Tambahkan timestamp untuk tracking
      const enhancedApplication = {
        ...applicationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      applications.push(enhancedApplication);
      
      // Update ranking untuk posisi yang sama
      this.updateRankings(applications, applicationData.position);
      
      localStorage.setItem(this.APPLICATIONS_KEY, JSON.stringify(applications));
      
      // Cache AI analysis untuk performa
      this.cacheAIAnalysis(applicationData);
      
      return enhancedApplication;
      
    } catch (error) {
      console.error('Error saving application:', error);
      throw new Error('Gagal menyimpan aplikasi');
    }
  }

  /**
   * Mengambil semua aplikasi
   */
  getApplications() {
    try {
      const data = localStorage.getItem(this.APPLICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  }

  /**
   * Mengambil aplikasi berdasarkan posisi
   */
  getApplicationsByPosition(position) {
    const applications = this.getApplications();
    return applications.filter(app => app.position === position);
  }

  /**
   * Update ranking berdasarkan AI Score
   */
  updateRankings(applications, position) {
    const positionApplicants = applications.filter(app => app.position === position);
    
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
      applicant.updatedAt = new Date().toISOString();
    });
  }

  /**
   * Cache AI analysis untuk performa
   */
  cacheAIAnalysis(applicationData) {
    try {
      const cache = this.getAICache();
      const cacheKey = `${applicationData.position}_${applicationData.name}_${applicationData.email}`;
      
      cache[cacheKey] = {
        aiScore: applicationData.aiScore,
        skills: applicationData.skills,
        aiAnalysis: applicationData.aiAnalysis,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 hari
      };
      
      localStorage.setItem(this.AI_CACHE_KEY, JSON.stringify(cache));
      
    } catch (error) {
      console.error('Error caching AI analysis:', error);
    }
  }

  /**
   * Mengambil AI cache
   */
  getAICache() {
    try {
      const data = localStorage.getItem(this.AI_CACHE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading AI cache:', error);
      return {};
    }
  }

  /**
   * Membersihkan cache yang expired
   */
  cleanExpiredCache() {
    try {
      const cache = this.getAICache();
      const now = new Date().toISOString();
      
      Object.keys(cache).forEach(key => {
        if (cache[key].expiresAt < now) {
          delete cache[key];
        }
      });
      
      localStorage.setItem(this.AI_CACHE_KEY, JSON.stringify(cache));
      
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  }

  /**
   * Mendapatkan statistik aplikasi
   */
  getApplicationStats() {
    const applications = this.getApplications();
    
    const stats = {
      total: applications.length,
      byPosition: {},
      averageScore: 0,
      topScorer: null,
      recentApplications: []
    };

    // Statistik per posisi
    applications.forEach(app => {
      if (!stats.byPosition[app.position]) {
        stats.byPosition[app.position] = {
          count: 0,
          averageScore: 0,
          topCandidate: null
        };
      }
      
      stats.byPosition[app.position].count++;
      
      if (!stats.byPosition[app.position].topCandidate || 
          app.aiScore > stats.byPosition[app.position].topCandidate.aiScore) {
        stats.byPosition[app.position].topCandidate = app;
      }
    });

    // Hitung average score per posisi
    Object.keys(stats.byPosition).forEach(position => {
      const positionApps = applications.filter(app => app.position === position);
      const totalScore = positionApps.reduce((sum, app) => sum + app.aiScore, 0);
      stats.byPosition[position].averageScore = Math.round(totalScore / positionApps.length);
    });

    // Overall average score
    if (applications.length > 0) {
      const totalScore = applications.reduce((sum, app) => sum + app.aiScore, 0);
      stats.averageScore = Math.round(totalScore / applications.length);
    }

    // Top scorer overall
    stats.topScorer = applications.reduce((top, app) => 
      !top || app.aiScore > top.aiScore ? app : top, null);

    // Recent applications (last 5)
    stats.recentApplications = applications
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, 5);

    return stats;
  }

  /**
   * Export data untuk backup
   */
  exportData() {
    return {
      applications: this.getApplications(),
      aiCache: this.getAICache(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import data dari backup
   */
  importData(data) {
    try {
      if (data.applications) {
        localStorage.setItem(this.APPLICATIONS_KEY, JSON.stringify(data.applications));
      }
      
      if (data.aiCache) {
        localStorage.setItem(this.AI_CACHE_KEY, JSON.stringify(data.aiCache));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Clear all data
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.APPLICATIONS_KEY);
      localStorage.removeItem(this.AI_CACHE_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Mendapatkan ukuran storage yang digunakan
   */
  getStorageSize() {
    if (typeof window === 'undefined') return 0;
    
    let totalSize = 0;

    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }

    return totalSize;
  }
}

// Export singleton instance
const storageManager = new StorageManager();
export default storageManager;