'use client';

import { useState } from 'react';

interface Props {
  id: string;
  mbtiResult: string;
}

export default function CopyButton({ id, mbtiResult }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/result/${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 px-5 py-3 rounded-xl bg-body text-white font-semibold text-sm transition-all duration-200 hover:bg-body/80 active:scale-95"
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}
