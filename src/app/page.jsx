"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const pengirim = form.pengirim.value;
    const lab = form.lab.value;
    const sampleId = form.sampleId.value;
    const sampleType = form.sampleType.value;
    const analysisRequest = form.analysisRequest.value;

    // Generate PDF
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = 50;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Request Analisis Sampel", margin, y);
    y += 30;

    doc.setLineWidth(1);
    doc.line(margin, y, 595 - margin, y);
    y += 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Pemohon: ${pengirim}`, margin, y); y += 20;
    doc.text(`Laboratorium Tujuan: ${lab}`, margin, y); y += 20;
    doc.text(`ID Sampel: ${sampleId}`, margin, y); y += 20;
    doc.text(`Jenis Sampel: ${sampleType}`, margin, y); y += 20;
    doc.text("Permintaan Analisis:", margin, y); y += 20;

    const splitText = doc.splitTextToSize(analysisRequest, 595 - 2 * margin);
    doc.text(splitText, margin, y);

    // Blob untuk Edge runtime
    const pdfBlob = new Blob([await doc.output("arraybuffer")], { type: "application/pdf" });
    const fileName = `${pengirim.replace(/\s+/g, "_")}_SampleRequest.pdf`;

    const formData = new FormData();
    formData.append("pengirim", pengirim);
    formData.append("lab", lab);
    formData.append("sampleId", sampleId);
    formData.append("sampleType", sampleType);
    formData.append("analysisRequest", analysisRequest);
    formData.append("file", pdfBlob, fileName);

    // Kirim ke API route
    const res = await fetch("/api/send-to-n8n", {
      method: "POST",
      body: formData,
    });

    if (res.ok) alert("PDF berhasil dikirim!");
    else alert("Gagal mengirim PDF.");

    setLoading(false);
    form.reset();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Form Request Analisis Sampel</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="pengirim" placeholder="Nama Pemohon" required /><br /><br />
        <input type="text" name="lab" placeholder="Laboratorium Tujuan" required /><br /><br />
        <input type="text" name="sampleId" placeholder="ID Sampel" required /><br /><br />
        <input type="text" name="sampleType" placeholder="Jenis Sampel" required /><br /><br />
        <textarea name="analysisRequest" placeholder="Jenis Analisis yang Diminta" required /><br /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Request"}
        </button>
      </form>
    </div>
  );
}
