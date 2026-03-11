'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-lg"
      >
        {/* GIF - 16:9 Aspect Ratio */}
        <div className="flex justify-center">
          <img
            src="https://files.catbox.moe/u8k4cu.gif"
            alt="Not Found"
            className="w-full max-w-md aspect-video object-cover rounded-2xl shadow-lg"
          />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center pt-4">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-card"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Link href="/">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              <Home className="w-4 h-4 mr-2" />
              Beranda
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
