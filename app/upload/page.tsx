'use client';

import { useUser } from '@clerk/nextjs';
import FileUploader from '@/components/FileUploader';
import { useState } from 'react';

export default function UploadPage({ personaId }: { personaId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) return setError('Please select a file.');
    setUploading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('personaId', personaId);
    formData.append('prompt', prompt);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error || 'Upload failed.');
    } else {
      setSuccess(true);
      setFile(null);
      setPrompt('');
    }

    setUploading(false);
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Upload to Persona</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full border p-2 rounded"
      />

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt for this persona..."
        rows={4}
        className="w-full border p-2 rounded text-sm"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Upload successful!</p>}
    </main>
  );
}

