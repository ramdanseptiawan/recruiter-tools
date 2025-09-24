import React, { useState } from 'react'; 
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react'; 

const PDFParser = () => { 
  const [pdfText, setPdfText] = useState(''); 
  const [fileName, setFileName] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [pageCount, setPageCount] = useState(0); 

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

  const extractTextFromPage = async (page) => { 
    const textContent = await page.getTextContent(); 
    return textContent.items.map(item => item.str).join(' '); 
  }; 

  const handleFileUpload = async (event) => { 
    const file = event.target.files[0]; 
    if (!file) return; 

    if (file.type !== 'application/pdf') { 
      setError('Mohon pilih file PDF yang valid'); 
      return; 
    } 

    setLoading(true); 
    setError(''); 
    setPdfText(''); 
    setFileName(file.name); 

    try { 
      // Load PDF.js library 
      const pdfjsLib = await loadPDFJS(); 

      // Convert file to ArrayBuffer 
      const arrayBuffer = await file.arrayBuffer(); 

      // Load PDF document 
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise; 
      setPageCount(pdf.numPages); 

      let fullText = ''; 

      // Extract text from each page 
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) { 
        const page = await pdf.getPage(pageNum); 
        const pageText = await extractTextFromPage(page); 
        fullText += `\n--- Halaman ${pageNum} ---\n${pageText}\n`; 
      } 

      setPdfText(fullText.trim()); 
    } catch (err) { 
      console.error('Error parsing PDF:', err); 
      setError('Gagal membaca file PDF. Pastikan file tidak rusak atau terproteksi.'); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  const downloadText = () => { 
    if (!pdfText) return; 

    const blob = new Blob([pdfText], { type: 'text/plain' }); 
    const url = URL.createObjectURL(blob); 
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `${fileName.replace('.pdf', '')}_extracted.txt`; 
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link); 
    URL.revokeObjectURL(url); 
  }; 

  return ( 
    <div className="max-w-4xl mx-auto p-6 space-y-6"> 
      <div className="text-center"> 
        <h1 className="text-3xl font-bold text-gray-800 mb-2">PDF Parser</h1> 
        <p className="text-gray-600">Upload file PDF untuk mengekstrak teksnya</p> 
      </div> 

      {/* Upload Area */} 
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"> 
        <div className="space-y-4"> 
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"> 
            <Upload className="w-8 h-8 text-blue-500" /> 
          </div> 
           
          <div> 
            <label htmlFor="pdf-upload" className="cursor-pointer"> 
              <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"> 
                Pilih File PDF 
              </span> 
            </label> 
            <input 
              id="pdf-upload" 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              className="hidden" 
            /> 
          </div> 
           
          <p className="text-sm text-gray-500"> 
            Atau drag & drop file PDF disini 
          </p> 
        </div> 
      </div> 

      {/* Loading State */} 
      {loading && ( 
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3"> 
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> 
          <span className="text-blue-700">Memproses PDF...</span> 
        </div> 
      )} 

      {/* Error State */} 
      {error && ( 
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"> 
          <AlertCircle className="w-5 h-5 text-red-500" /> 
          <span className="text-red-700">{error}</span> 
        </div> 
      )} 

      {/* Results */} 
      {pdfText && ( 
        <div className="space-y-4"> 
          <div className="flex items-center justify-between"> 
            <div className="flex items-center space-x-2"> 
              <FileText className="w-5 h-5 text-green-600" /> 
              <span className="text-green-700 font-medium"> 
                Berhasil mengekstrak dari {fileName} ({pageCount} halaman) 
              </span> 
            </div> 
            <button 
              onClick={downloadText} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" 
            > 
              Download Teks 
            </button> 
          </div> 

          <div className="bg-gray-50 border rounded-lg p-4"> 
            <h3 className="font-semibold text-gray-800 mb-3">Teks yang Diekstrak:</h3> 
            <div className="bg-white border rounded p-4 max-h-96 overflow-y-auto"> 
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono"> 
                {pdfText} 
              </pre> 
            </div> 
          </div> 

          <div className="text-sm text-gray-500 text-center"> 
            Total karakter: {pdfText.length.toLocaleString()} 
          </div> 
        </div> 
      )} 
    </div> 
  ); 
}; 

export default PDFParser;