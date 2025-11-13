"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: { data: { type: string; path: string; }; }) => {
      // For production, validate event.origin for security
      if (event.data.type === 'navigate') {
        router.push(event.data.path);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  return (
    <>
    <iframe 
        src="/home/finz-template.webflow.io/index.html" 
        style={{ width: '100%', height: '100vh', border: 'none' }}
        title="HTML Project"
      />
    </>
  );
}
