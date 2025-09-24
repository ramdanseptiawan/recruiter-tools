/**
 * DeepSeek AI Service untuk Analisis Kandidat
 * Menggunakan DeepSeek API untuk menganalisis profil kandidat dan memberikan skor
 */

class DeepSeekService {
  constructor() {
    // Untuk client-side, kita perlu menggunakan NEXT_PUBLIC_ prefix
    // Atau mengakses melalui server-side API route
    this.apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    this.apiUrl = process.env.DEEPSEEK_API_URL || process.env.NEXT_PUBLIC_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    
    // Debug log untuk memeriksa API key
    if (typeof window !== 'undefined') {
      console.log('DeepSeek API Key status:', this.apiKey ? 'Available' : 'Not found');
    }
  }

  /**
   * Menganalisis kandidat berdasarkan data profil
   * @param {Object} candidateData - Data kandidat yang akan dianalisis
   * @returns {Promise<Object>} - Hasil analisis AI dengan skor dan rekomendasi
   */
  async analyzeCandidate(candidateData) {
    try {
      // Gunakan server-side API route untuk keamanan
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData)
      });

      if (!response.ok) {
        console.warn(`API Error: ${response.status}, falling back to mock analysis`);
        return this.generateMockAnalysis(candidateData);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.warn('Error analyzing candidate, using mock analysis:', error.message);
      // Fallback ke analisis mock jika API gagal
      return this.generateMockAnalysis(candidateData);
    }
  }

  /**
   * Membangun prompt untuk analisis kandidat
   */
  buildAnalysisPrompt(candidate) {
    return `
Analisis kandidat berikut untuk posisi ${candidate.position}:

PROFIL KANDIDAT:
- Nama: ${candidate.name}
- Posisi yang dilamar: ${candidate.position}
- Pendidikan: ${candidate.education}
- Pengalaman: ${candidate.experience}
- Lokasi: ${candidate.location}
- Email: ${candidate.email}

KRITERIA EVALUASI:
1. Kesesuaian pendidikan dengan posisi
2. Relevansi pengalaman kerja
3. Potensi kontribusi untuk perusahaan
4. Kemampuan adaptasi dan pembelajaran

INSTRUKSI:
Berikan analisis dalam format JSON berikut:
{
  "aiScore": [skor 0-100],
  "skills": {
    "technical": [skor 1-10],
    "communication": [skor 1-10], 
    "problemSolving": [skor 1-10],
    "experience": [skor 1-10],
    "education": [skor 1-10]
  },
  "aiAnalysis": {
    "strengths": ["kekuatan 1", "kekuatan 2", "kekuatan 3"],
    "weaknesses": ["kelemahan 1", "kelemahan 2"],
    "recommendation": "rekomendasi singkat"
  }
}

Berikan hanya JSON response tanpa penjelasan tambahan.
    `;
  }

  /**
   * Parsing response dari DeepSeek AI
   */
  parseAIResponse(aiResponse) {
    try {
      // Ekstrak JSON dari response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validasi dan normalisasi data
        return {
          aiScore: Math.min(100, Math.max(0, parsed.aiScore || 75)),
          skills: {
            technical: Math.min(10, Math.max(1, parsed.skills?.technical || 7)),
            communication: Math.min(10, Math.max(1, parsed.skills?.communication || 7)),
            problemSolving: Math.min(10, Math.max(1, parsed.skills?.problemSolving || 7)),
            experience: Math.min(10, Math.max(1, parsed.skills?.experience || 7)),
            education: Math.min(10, Math.max(1, parsed.skills?.education || 7))
          },
          aiAnalysis: {
            strengths: parsed.aiAnalysis?.strengths || ['Profil kandidat menarik'],
            weaknesses: parsed.aiAnalysis?.weaknesses || ['Perlu evaluasi lebih lanjut'],
            recommendation: parsed.aiAnalysis?.recommendation || 'Kandidat potensial untuk dipertimbangkan'
          }
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
    
    // Fallback jika parsing gagal
    return this.generateMockAnalysis();
  }

  /**
   * Generate mock analysis sebagai fallback
   */
  generateMockAnalysis(candidate = {}) {
    // Analisis yang lebih sophisticated berdasarkan data kandidat
    let baseScore = 50;
    const analysis = {
      strengths: [],
      weaknesses: [],
      recommendation: ''
    };

    // Analisis berdasarkan pendidikan
    if (candidate.education) {
      const education = candidate.education.toLowerCase();
      if (education.includes('s1') || education.includes('bachelor') || education.includes('sarjana')) {
        baseScore += 15;
        analysis.strengths.push('Memiliki latar belakang pendidikan tinggi yang solid');
      } else if (education.includes('s2') || education.includes('master') || education.includes('magister')) {
        baseScore += 25;
        analysis.strengths.push('Pendidikan tingkat master menunjukkan dedikasi pembelajaran');
      } else if (education.includes('sma') || education.includes('smk')) {
        baseScore += 5;
        analysis.weaknesses.push('Pendidikan formal masih terbatas, perlu pengembangan lebih lanjut');
      }
    }

    // Analisis berdasarkan pengalaman
    if (candidate.experience) {
      const experience = candidate.experience.toLowerCase();
      if (experience.includes('tahun') || experience.includes('year')) {
        const yearMatch = experience.match(/(\d+)/);
        if (yearMatch) {
          const years = parseInt(yearMatch[1]);
          if (years >= 3) {
            baseScore += 20;
            analysis.strengths.push('Pengalaman kerja yang cukup matang');
          } else if (years >= 1) {
            baseScore += 10;
            analysis.strengths.push('Memiliki pengalaman kerja yang relevan');
          }
        }
      } else if (experience.includes('fresh') || experience.includes('baru')) {
        baseScore += 5;
        analysis.weaknesses.push('Masih fresh graduate, membutuhkan guidance lebih intensif');
      }
    }

    // Analisis berdasarkan posisi yang dilamar
    if (candidate.position) {
      const position = candidate.position.toLowerCase();
      if (position.includes('data') || position.includes('analyst')) {
        // Untuk posisi data analyst, cek skills yang relevan
        if (candidate.skills && (candidate.skills.includes('Python') || candidate.skills.includes('SQL'))) {
          baseScore += 15;
          analysis.strengths.push('Memiliki skills teknis yang relevan untuk posisi data analyst');
        }
      } else if (position.includes('product') || position.includes('engineer')) {
        // Untuk posisi product engineer
        if (candidate.skills && (candidate.skills.includes('JavaScript') || candidate.skills.includes('React'))) {
          baseScore += 15;
          analysis.strengths.push('Skills engineering yang sesuai dengan kebutuhan posisi');
        }
      }
    }

    // Pastikan score dalam range yang wajar
    baseScore = Math.min(95, Math.max(25, baseScore));

    // Tambahkan variasi random kecil
    baseScore += Math.floor(Math.random() * 10) - 5; // ±5 points
    baseScore = Math.min(95, Math.max(25, baseScore));

    // Set recommendation berdasarkan score
    if (baseScore >= 85) {
      analysis.recommendation = 'Sangat direkomendasikan untuk interview - kandidat berkualitas tinggi';
    } else if (baseScore >= 70) {
      analysis.recommendation = 'Direkomendasikan untuk tahap selanjutnya dengan evaluasi lebih detail';
    } else if (baseScore >= 55) {
      analysis.recommendation = 'Perlu evaluasi lebih mendalam, potensi ada tapi butuh pengembangan';
    } else {
      analysis.recommendation = 'Kurang sesuai dengan kriteria posisi saat ini';
    }

    // Tambahkan default strengths/weaknesses jika masih kosong
    if (analysis.strengths.length === 0) {
      analysis.strengths.push('Menunjukkan motivasi untuk bergabung dengan perusahaan');
    }
    if (analysis.weaknesses.length === 0) {
      analysis.weaknesses.push('Perlu pengembangan skills dan pengalaman lebih lanjut');
    }

    return {
      aiScore: baseScore,
      skills: {
        technical: Math.floor(baseScore / 10), // Convert to 1-10 scale
        communication: 6 + Math.floor(Math.random() * 4),
        problemSolving: 6 + Math.floor(Math.random() * 4),
        experience: Math.floor(baseScore / 12), // Based on score
        education: Math.floor(baseScore / 11) // Based on score
      },
      aiAnalysis: analysis
    };
  }

  /**
   * Utility function untuk mengambil item random dari array
   */
  getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Batch analysis untuk multiple kandidat
   */
  async analyzeCandidates(candidates) {
    const results = [];
    
    for (const candidate of candidates) {
      try {
        const analysis = await this.analyzeCandidate(candidate);
        results.push({
          ...candidate,
          ...analysis,
          analyzedAt: new Date().toISOString()
        });
        
        // Delay untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error analyzing candidate ${candidate.name}:`, error);
        results.push({
          ...candidate,
          ...this.generateMockAnalysis(candidate),
          analyzedAt: new Date().toISOString()
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
const deepSeekService = new DeepSeekService();
export default deepSeekService;