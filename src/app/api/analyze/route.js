import { NextResponse } from 'next/server';

/**
 * Server-side API route untuk DeepSeek AI Analysis
 * Ini memungkinkan kita menggunakan API key secara aman di server-side
 */
export async function POST(request) {
  try {
    const candidateData = await request.json();
    
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    
    // Cek apakah API key tersedia
    if (!apiKey || apiKey === 'your-deepseek-api-key-here') {
      console.warn('DeepSeek API key not configured, using mock analysis');
      return NextResponse.json(generateMockAnalysis(candidateData));
    }

    const prompt = buildAnalysisPrompt(candidateData);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Anda adalah AI recruiter expert yang menganalisis kandidat berdasarkan posisi yang dilamar. Berikan analisis objektif dan skor yang akurat.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      console.warn(`DeepSeek API Error: ${response.status}, falling back to mock analysis`);
      return NextResponse.json(generateMockAnalysis(candidateData));
    }

    const result = await response.json();
    const analysis = parseAIResponse(result.choices[0].message.content);
    
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.warn('Error analyzing candidate with DeepSeek API, using mock analysis:', error.message);
    const candidateData = await request.json().catch(() => ({}));
    return NextResponse.json(generateMockAnalysis(candidateData));
  }
}

/**
 * Membangun prompt untuk analisis kandidat
 */
function buildAnalysisPrompt(candidate) {
  let prompt = `
Analisis kandidat berikut untuk posisi ${candidate.position}:

PROFIL KANDIDAT:
- Nama: ${candidate.name}
- Posisi yang dilamar: ${candidate.position}
- Pendidikan: ${candidate.education}
- Pengalaman: ${candidate.experience}
- Lokasi: ${candidate.location}
- Email: ${candidate.email}`;

  // Add skills if available from PDF parsing
  if (candidate.skills && candidate.skills.length > 0) {
    prompt += `
- Skills: ${candidate.skills.join(', ')}`;
  }

  // Add essay
  if (candidate.essay) {
    prompt += `

ESSAY KANDIDAT:
${candidate.essay}`;
  }

  // Add CV content if available from PDF parsing
  if (candidate.cvText) {
    prompt += `

KONTEN CV (dari PDF):
${candidate.cvText.substring(0, 2000)}...`; // Limit to 2000 chars to avoid token limit
  }

  prompt += `

KRITERIA EVALUASI:
1. Kesesuaian pendidikan dengan posisi
2. Relevansi pengalaman kerja
3. Potensi kontribusi untuk perusahaan
4. Kemampuan adaptasi dan pembelajaran
5. Kualitas komunikasi (dari essay)`;

  // Add CV-specific criteria if CV text is available
  if (candidate.cvText) {
    prompt += `
6. Kelengkapan dan kualitas CV
7. Relevansi skills dan sertifikasi
8. Konsistensi informasi antara form dan CV`;
  }

  prompt += `

INSTRUKSI:
Berikan analisis dalam format JSON berikut:
{
  "aiScore": [number 1-100],
  "skills": {
    "technical": [number 1-10],
    "communication": [number 1-10],
    "problemSolving": [number 1-10],
    "experience": [number 1-10],
    "education": [number 1-10]
  },
  "aiAnalysis": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendation": "detailed recommendation"
  }
}

Berikan hanya JSON response tanpa penjelasan tambahan.
`;

  return prompt;
}

/**
 * Parse response dari AI
 */
function parseAIResponse(content) {
  try {
    // Coba parse JSON langsung
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    // Jika gagal, coba extract JSON dari text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn('Failed to parse AI response, using mock analysis');
      }
    }
    
    // Fallback ke mock analysis
    return generateMockAnalysis();
  }
}

/**
 * Generate mock analysis sebagai fallback
 */
function generateMockAnalysis(candidate = {}) {
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
      analysis.weaknesses.push('Pendidikan formal masih terbatas untuk posisi ini');
    }
  }

  // Analisis berdasarkan pengalaman
  if (candidate.experience) {
    const exp = candidate.experience.toLowerCase();
    if (exp.includes('3') || exp.includes('4') || exp.includes('5')) {
      baseScore += 20;
      analysis.strengths.push('Memiliki pengalaman kerja yang relevan dan memadai');
    } else if (exp.includes('1') || exp.includes('2')) {
      baseScore += 10;
      analysis.strengths.push('Memiliki pengalaman kerja dasar');
    } else if (exp.includes('fresh') || exp.includes('baru')) {
      analysis.weaknesses.push('Masih membutuhkan bimbingan dan pelatihan');
    }
  }

  // Analisis berdasarkan skills dari PDF parsing
  if (candidate.skills && candidate.skills.length > 0) {
    baseScore += Math.min(candidate.skills.length * 2, 15); // Max 15 points for skills
    analysis.strengths.push(`Memiliki ${candidate.skills.length} skills teknis yang relevan: ${candidate.skills.slice(0, 3).join(', ')}`);
  }

  // Analisis berdasarkan CV text (jika ada)
  if (candidate.cvText) {
    const cvLength = candidate.cvText.length;
    if (cvLength > 1000) {
      baseScore += 10;
      analysis.strengths.push('CV lengkap dan detail dengan informasi yang komprehensif');
    } else if (cvLength > 500) {
      baseScore += 5;
      analysis.strengths.push('CV cukup informatif');
    } else {
      analysis.weaknesses.push('CV terlalu singkat, kurang detail');
    }

    // Check for specific keywords in CV
    const cvText = candidate.cvText.toLowerCase();
    const positiveKeywords = ['project', 'achievement', 'leadership', 'team', 'success', 'award'];
    const foundKeywords = positiveKeywords.filter(keyword => cvText.includes(keyword));
    if (foundKeywords.length > 2) {
      baseScore += 8;
      analysis.strengths.push('CV menunjukkan pencapaian dan pengalaman yang baik');
    }
  }

  // Analisis berdasarkan essay
  if (candidate.essay) {
    const essayLength = candidate.essay.length;
    if (essayLength > 200) {
      baseScore += 8;
      analysis.strengths.push('Essay menunjukkan kemampuan komunikasi tertulis yang baik');
    } else if (essayLength > 100) {
      baseScore += 4;
    } else {
      analysis.weaknesses.push('Essay terlalu singkat, kurang menunjukkan motivasi');
    }
  }

  // Add random variation
  baseScore += Math.floor(Math.random() * 11) - 5; // -5 to +5

  // Ensure score is within bounds
  const aiScore = Math.max(10, Math.min(100, baseScore));

  // Generate recommendation based on score
  if (aiScore >= 80) {
    analysis.recommendation = 'Kandidat sangat direkomendasikan untuk posisi ini. Memiliki kualifikasi yang sangat baik dan potensi kontribusi yang tinggi.';
  } else if (aiScore >= 60) {
    analysis.recommendation = 'Kandidat direkomendasikan dengan beberapa catatan. Perlu evaluasi lebih lanjut pada aspek tertentu.';
  } else if (aiScore >= 40) {
    analysis.recommendation = 'Kandidat memiliki potensi namun membutuhkan pengembangan lebih lanjut. Pertimbangkan untuk posisi junior atau dengan training tambahan.';
  } else {
    analysis.recommendation = 'Kandidat belum memenuhi kualifikasi minimum untuk posisi ini. Disarankan untuk mencari kandidat lain atau memberikan pelatihan intensif.';
  }

  // Ensure we have at least some strengths and weaknesses
  if (analysis.strengths.length === 0) {
    analysis.strengths.push('Menunjukkan minat untuk bergabung dengan perusahaan');
  }
  if (analysis.weaknesses.length === 0) {
    analysis.weaknesses.push('Perlu pengembangan lebih lanjut dalam beberapa aspek');
  }

  return {
    aiScore,
    skills: {
      technical: Math.max(1, Math.min(10, Math.floor(aiScore / 12))),
      communication: Math.max(1, Math.min(10, Math.floor(aiScore / 11))),
      problemSolving: Math.max(1, Math.min(10, Math.floor(aiScore / 13))),
      experience: Math.max(1, Math.min(10, Math.floor(aiScore / 10))),
      education: Math.max(1, Math.min(10, Math.floor(aiScore / 9)))
    },
    aiAnalysis: analysis
  };
}