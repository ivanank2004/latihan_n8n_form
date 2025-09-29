'use client';
import { useState } from 'react';
import { jsPDF } from 'jspdf';

export default function Page() {
  const [pengirim, setPengirim] = useState('');
  const [lab, setLab] = useState('');
  const [sampleId, setSampleId] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [analysisRequest, setAnalysisRequest] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate PDF
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = 50;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Request Analisis Sampel', margin, y);
    y += 30;
    doc.setLineWidth(1);
    doc.line(margin, y, 595 - margin, y);
    y += 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pemohon: ${pengirim}`, margin, y); y += 20;
    doc.text(`Laboratorium Tujuan: ${lab}`, margin, y); y += 20;
    doc.text(`ID Sampel: ${sampleId}`, margin, y); y += 20;
    doc.text(`Jenis Sampel: ${sampleType}`, margin, y); y += 20;

    doc.text('Permintaan Analisis:', margin, y); y += 20;
    const splitText = doc.splitTextToSize(analysisRequest, 595 - 2 * margin);
    doc.text(splitText, margin, y);

    const pdfBlob = doc.output('blob');
    const fileName = `${pengirim.replace(/\s+/g, '_')}_SampleRequest.pdf`;

    // Kirim ke API route
    const formData = new FormData();
    formData.append('pengirim', pengirim);
    formData.append('lab', lab);
    formData.append('sampleId', sampleId);
    formData.append('sampleType', sampleType);
    formData.append('analysisRequest', analysisRequest);
    formData.append('file', pdfBlob, fileName);

    const res = await fetch('/api/send-to-n8n', { method: 'POST', body: formData });
    if (res.ok) alert(`PDF berhasil dikirim sebagai "${fileName}"!`);
    else alert('Terjadi kesalahan.');
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Form Request Analisis Sampel</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nama Pemohon" value={pengirim} onChange={e => setPengirim(e.target.value)} required /><br/><br/>
        <input type="text" placeholder="Laboratorium Tujuan" value={lab} onChange={e => setLab(e.target.value)} required /><br/><br/>
        <input type="text" placeholder="ID Sampel" value={sampleId} onChange={e => setSampleId(e.target.value)} required /><br/><br/>
        <input type="text" placeholder="Jenis Sampel" value={sampleType} onChange={e => setSampleType(e.target.value)} required /><br/><br/>
        <textarea placeholder="Jenis Analisis yang Diminta" value={analysisRequest} onChange={e => setAnalysisRequest(e.target.value)} required /><br/><br/>
        <button type="submit">Kirim Request</button>
      </form>
    </div>
  );
}
