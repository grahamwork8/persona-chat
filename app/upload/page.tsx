'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function UploadPage() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStatus('Uploading...');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const { path } = await res.json();
      setStatus(`✅ Uploaded to: ${path}`);
    } else {
      setStatus('❌ Upload failed');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload RAG File</h1>
      <p className="mb-2 text-gray-600">
  Signed in as: {user?.primaryEmailAddress?.emailAddress}
</p>


      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={!file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Upload
      </button>

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </div>
  );
}
