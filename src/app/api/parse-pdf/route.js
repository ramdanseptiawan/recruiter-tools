// import { NextResponse } from 'next/server';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// // Set worker path untuk pdfjs-dist
// if (typeof window === 'undefined') {
//   // Server-side configuration
//   const pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.js');
// }

// /**
//  * API endpoint untuk parsing PDF CV
//  * Mengekstrak text dari file PDF yang diupload
//  */
// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('pdf');
    
//     console.log('PDF upload attempt:', {
//       hasFile: !!file,
//       fileName: file?.name,
//       fileSize: file?.size,
//       fileType: file?.type
//     });
    
//     if (!file) {
//       return NextResponse.json(
//         { error: 'No PDF file provided' },
//         { status: 400 }
//       );
//     }

//     // Validasi file type
//     if (file.type !== 'application/pdf') {
//       console.log('Invalid file type:', file.type);
//       return NextResponse.json(
//         { error: 'File must be a PDF' },
//         { status: 400 }
//       );
//     }

//     // Validasi file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       console.log('File too large:', file.size);
//       return NextResponse.json(
//         { error: 'File size must be less than 5MB' },
//         { status: 400 }
//       );
//     }

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     console.log('Buffer created:', {
//       bufferLength: buffer.length,
//       isBuffer: Buffer.isBuffer(buffer)
//     });

//     // Validate buffer
//     if (!buffer || buffer.length === 0) {
//       console.log('Invalid buffer');
//       return NextResponse.json(
//         { error: 'Invalid PDF file - empty buffer' },
//         { status: 400 }
//       );
//     }

//     // Parse PDF dengan pdfjs-dist
//     let extractedText = '';
//     let numPages = 0;
    
//     try {
//       console.log('Starting PDF parse with pdfjs-dist...');
      
//       // Load PDF document
//       const loadingTask = pdfjsLib.getDocument({
//         data: new Uint8Array(buffer),
//         verbosity: 0 // Disable console warnings
//       });
      
//       const pdf = await loadingTask.promise;
//       numPages = pdf.numPages;
      
//       console.log('PDF loaded successfully:', {
//         pages: numPages
//       });
      
//       // Extract text from all pages
//       for (let pageNum = 1; pageNum <= numPages; pageNum++) {
//         const page = await pdf.getPage(pageNum);
//         const textContent = await page.getTextContent();
        
//         // Combine text items
//         const pageText = textContent.items
//           .map(item => item.str)
//           .join(' ');
        
//         extractedText += pageText + '\n';
//       }
      
//       console.log('PDF parsed successfully:', {
//         pages: numPages,
//         textLength: extractedText.length
//       });
      
//     } catch (parseError) {
//       console.error('PDF parse specific error:', parseError);
//       console.error('Error details:', {
//         name: parseError.name,
//         message: parseError.message,
//         stack: parseError.stack
//       });
      
//       // Return user-friendly error message
//       return NextResponse.json(
//         { error: 'PDF file could not be processed. The file may be corrupted or password-protected.' },
//         { status: 400 }
//       );
//     }
    
//     // Basic text cleaning
//     const cleanedText = extractedText
//       .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
//       .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
//       .trim();

//     // Extract basic information using regex patterns
//     const extractedInfo = extractBasicInfo(cleanedText);

//     console.log('PDF processing completed successfully');

//     return NextResponse.json({
//       success: true,
//       text: cleanedText,
//       extractedInfo: extractedInfo,
//       metadata: {
//         pages: numPages,
//         fileSize: file.size,
//         fileName: file.name
//       }
//     });

//   } catch (error) {
//     console.error('PDF parsing error:', error);
//     console.error('Error details:', {
//       name: error.name,
//       message: error.message,
//       stack: error.stack
//     });
    
//     // Provide more specific error messages
//     let errorMessage = 'Failed to parse PDF';
//     if (error.name === 'InvalidPDFException') {
//       errorMessage = 'Invalid PDF format - please upload a valid PDF file';
//     } else if (error.name === 'PasswordException') {
//       errorMessage = 'PDF is password protected. Please upload an unprotected PDF file.';
//     } else if (error.message.includes('network')) {
//       errorMessage = 'Network error while processing PDF. Please try again.';
//     }
    
//     return NextResponse.json(
//       { error: errorMessage, details: error.message },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * Extract basic information from CV text using regex patterns
//  */
// function extractBasicInfo(text) {
//   const info = {
//     name: null,
//     email: null,
//     phone: null,
//     education: null,
//     experience: null,
//     skills: []
//   };

//   // Extract email
//   const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
//   if (emailMatch) {
//     info.email = emailMatch[0];
//   }

//   // Extract phone number (Indonesian format)
//   const phoneMatch = text.match(/(?:\+62|62|0)[0-9]{8,13}/);
//   if (phoneMatch) {
//     info.phone = phoneMatch[0];
//   }

//   // Extract name (usually at the beginning, before email)
//   const lines = text.split('\n').filter(line => line.trim().length > 0);
//   if (lines.length > 0) {
//     // Try to find name in first few lines
//     for (let i = 0; i < Math.min(5, lines.length); i++) {
//       const line = lines[i].trim();
//       // Skip if line contains email or phone
//       if (line.includes('@') || /[0-9]{8,}/.test(line)) continue;
//       // Skip if line is too short or too long
//       if (line.length < 3 || line.length > 50) continue;
//       // Skip if line contains common CV headers
//       if (/curriculum|vitae|resume|cv/i.test(line)) continue;
      
//       // This might be the name
//       if (/^[A-Za-z\s.]+$/.test(line)) {
//         info.name = line;
//         break;
//       }
//     }
//   }

//   // Extract education level
//   const educationKeywords = {
//     'S3': ['S3', 'Doktor', 'PhD', 'Ph.D'],
//     'S2': ['S2', 'Master', 'Magister', 'M.'],
//     'S1': ['S1', 'Sarjana', 'Bachelor', 'B.'],
//     'D3': ['D3', 'Diploma'],
//     'SMA': ['SMA', 'SMK', 'MA']
//   };

//   for (const [level, keywords] of Object.entries(educationKeywords)) {
//     for (const keyword of keywords) {
//       if (text.includes(keyword)) {
//         info.education = level;
//         break;
//       }
//     }
//     if (info.education) break;
//   }

//   // Extract experience (look for years)
//   const experienceMatch = text.match(/(\d+)\s*(?:tahun|year|th)/i);
//   if (experienceMatch) {
//     info.experience = `${experienceMatch[1]} tahun`;
//   } else {
//     // Try to count job positions or work experience sections
//     const workKeywords = ['kerja', 'bekerja', 'pengalaman', 'experience', 'work'];
//     let experienceCount = 0;
//     for (const keyword of workKeywords) {
//       const matches = text.toLowerCase().match(new RegExp(keyword, 'g'));
//       if (matches) experienceCount += matches.length;
//     }
//     if (experienceCount > 2) {
//       info.experience = 'Berpengalaman';
//     } else {
//       info.experience = 'Fresh Graduate';
//     }
//   }

//   // Extract skills (common technical skills)
//   const skillKeywords = [
//     'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
//     'Excel', 'PowerPoint', 'Word', 'Photoshop', 'Illustrator', 'AutoCAD',
//     'Project Management', 'Leadership', 'Communication', 'Teamwork',
//     'Data Analysis', 'Machine Learning', 'AI', 'Database', 'Git'
//   ];

//   for (const skill of skillKeywords) {
//     if (text.toLowerCase().includes(skill.toLowerCase())) {
//       info.skills.push(skill);
//     }
//   }

//   return info;
// }