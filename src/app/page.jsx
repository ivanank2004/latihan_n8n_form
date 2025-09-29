"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // FETCH LIST USERS DARI WORKFLOW GET USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_N8N_GETUSERS_WEBHOOK_URL); // GET workflow
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Gagal ambil user:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const pengirim = form.pengirim.value;
    const lab = form.lab.value;
    const sampleId = form.sampleId.value;
    const sampleType = form.sampleType.value;
    const analysisRequest = form.analysisRequest.value;
    const recipientName = form.recipient.value;

    // CARI CHAT_ID DARI USER
    const recipientUser = users.find(u => u.name.trim() === recipientName.trim());
    const recipientChatId = recipientUser ? recipientUser.chat_id : null;

    if (!recipientChatId) {
      alert("Penerima tidak valid!");
      setLoading(false);
      return;
    }

    // GENERATE PDF
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = 50;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Request Analisis Sampel", margin, y); y += 30;
    doc.setLineWidth(1);
    doc.line(margin, y, 595 - margin, y); y += 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Pemohon: ${pengirim}`, margin, y); y += 20;
    doc.text(`Laboratorium Tujuan: ${lab}`, margin, y); y += 20;
    doc.text(`ID Sampel: ${sampleId}`, margin, y); y += 20;
    doc.text(`Jenis Sampel: ${sampleType}`, margin, y); y += 20;
    doc.text(`Kepada: ${recipientName}`, margin, y); y += 20;
    doc.text("Permintaan Analisis:", margin, y); y += 20;
    const splitText = doc.splitTextToSize(analysisRequest, 595 - 2 * margin);
    doc.text(splitText, margin, y);

    const pdfBlob = new Blob([await doc.output("arraybuffer")], { type: "application/pdf" });
    const fileName = `${pengirim.replace(/\s+/g, "_")}_SampleRequest.pdf`;

    // FORM DATA UNTUK API ROUTE
    const formData = new FormData();
    formData.append("pengirim", pengirim);
    formData.append("lab", lab);
    formData.append("sampleId", sampleId);
    formData.append("sampleType", sampleType);
    formData.append("analysisRequest", analysisRequest);
    formData.append("recipientName", recipientName);
    formData.append("recipientChatId", recipientChatId);
    formData.append("file", pdfBlob, fileName);

    try {
      const res = await fetch("/api/send-to-n8n", { method: "POST", body: formData });
      if (res.ok) alert("PDF berhasil dikirim!");
      else {
        const data = await res.json();
        alert("Gagal mengirim PDF: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim PDF.");
    }

    setLoading(false);
    form.reset();
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Form Request Analisis Sampel</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nama Pemohon */}
        <div>
          <label className="block font-medium mb-1">Nama Pemohon</label>
          <input type="text" name="pengirim" placeholder="Nama Pemohon" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        {/* ID Sampel */}
        <div>
          <label className="block font-medium mb-1">ID Sampel</label>
          <input type="text" name="sampleId" placeholder="ID Sampel" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        {/* Laboratorium Tujuan */}
        <div>
          <label className="block font-medium mb-1">Laboratorium Tujuan</label>
          <select name="lab" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">--Pilih Lab--</option>
            <option value="Lab Kimia Industri">Lab Kimia Industri</option>
            <option value="Lab Lingkungan">Lab Lingkungan</option>
            <option value="Lab Gas dan Emisi">Lab Gas dan Emisi</option>
          </select>
        </div>

        {/* Jenis Sampel */}
        <div>
          <label className="block font-medium mb-1">Jenis Sampel</label>
          <select name="sampleType" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">--Pilih Jenis Sampel--</option>
            <option value="Air Pendingin">Air Pendingin</option>
            <option value="Ammonia Cair">Ammonia Cair</option>
            <option value="Uap Gas">Uap Gas</option>
            <option value="Bahan Baku">Bahan Baku</option>
            <option value="Limbah Cair">Limbah Cair</option>
          </select>
        </div>

        {/* Permintaan Analisis */}
        <div>
          <label className="block font-medium mb-1">Permintaan Analisis</label>
          <select name="analysisRequest" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">--Pilih Analisis--</option>
            <option value="Kadar Ammonia">Kadar Ammonia</option>
            <option value="pH dan Alkalinitas">pH dan Alkalinitas</option>
            <option value="Kadar Logam Berat">Kadar Logam Berat</option>
            <option value="Kadar Nitrat/Nitrit">Kadar Nitrat/Nitrit</option>
            <option value="Emisi Gas NOx">Emisi Gas NOx</option>
            <option value="Kandungan Bahan Baku">Kandungan Bahan Baku</option>
          </select>
        </div>

        {/* Dropdown Penerima */}
        <div>
          <label className="block font-medium mb-1">Penerima</label>
          <select name="recipient" required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">--Pilih Penerima--</option>
            {users.map((user) => (
              <option key={user.chat_id} value={user.name}>{user.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className={`w-full py-2 px-4 text-white font-semibold rounded ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? "Mengirim..." : "Kirim Request"}
        </button>
      </form>
    </div>
  );
}
