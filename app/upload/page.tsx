'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function UploadPage() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file || !user?.id) return setError('Missing file or user ID.');
    setUploading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id); // ✅ uploader identity
    formData.append('prompt', prompt);  // ✅ persona prompt

    for (const [key, value] of formData.entries()) {
      console.log(`🧾 ${key}:`, value);
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Upload failed.');
    } else {
      setSuccess(true);
      console.log('✅ Persona created with ID:', result.Id);
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
