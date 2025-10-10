'use client';
import { useState } from 'react';

export default function FileUploader({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file || !userId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (res.ok) {
      setStatus(`✅ Uploaded to: ${result.path}`);
    } else {
      setStatus(`❌ Upload failed: ${result.error}`);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-800"
      >
        Upload
      </button>
      <p className="text-sm text-gray-500">{status}</p>
    </div>
  );
}
