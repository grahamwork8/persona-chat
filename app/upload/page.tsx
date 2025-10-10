'use client';

import { useUser } from '@clerk/nextjs';
import FileUploader from '@/components/FileUploader';

export default function UploadPage() {
  const { user } = useUser();

  if (!user) return <p>Please sign in</p>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload a file</h1>
      <FileUploader userId={user.id} />
    </main>
  );
}
