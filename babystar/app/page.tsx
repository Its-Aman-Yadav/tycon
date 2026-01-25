"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Heart, Sparkles, RefreshCw, Download, Camera, Users } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [motherImage, setMotherImage] = useState<string | null>(null);
  const [fatherImage, setFatherImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gender, setGender] = useState<'boy' | 'girl' | 'surprise'>('surprise');

  const motherInputRef = useRef<HTMLInputElement>(null);
  const fatherInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'mother' | 'father') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'mother') setMotherImage(reader.result as string);
        else setFatherImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBaby = async () => {
    if (!motherImage || !fatherImage) {
      setError("Please upload both parents' photos.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const response = await fetch("/api/generate-baby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motherImage, fatherImage, gender }),
      });

      const data = await response.json();
      if (response.ok) {
        setResultImage(data.image);
      } else {
        throw new Error(data.error || "Failed to generate baby photo.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setMotherImage(null);
    setFatherImage(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-pink-100 text-pink-500 font-medium mb-6"
          >
            <Sparkles size={18} />
            <span>AI-Powered Baby Generator</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Meet Your <span className="text-gradient">Future Baby</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4"
          >
            Using advanced neural networks to blend features and generate a stunning preview of your future child.
          </motion.p>
        </header>

        {!resultImage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Parent Uploaders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Users className="text-pink-400" />
                Parents' Photos
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {/* Mother Input */}
                <div
                  onClick={() => motherInputRef.current?.click()}
                  className={`relative h-56 md:h-64 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 ${motherImage ? 'border-pink-300 bg-pink-50/30' : 'border-neutral-200 hover:border-pink-200 hover:bg-neutral-50/50'
                    }`}
                >
                  <input
                    type="file"
                    ref={motherInputRef}
                    onChange={(e) => handleImageUpload(e, 'mother')}
                    className="hidden"
                    accept="image/*"
                  />
                  {motherImage ? (
                    <img src={motherImage} alt="Mother" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-pink-100 text-pink-500">
                        <Camera size={24} />
                      </div>
                      <span className="font-medium text-neutral-600">Upload Mother's Photo</span>
                    </>
                  )}
                  {motherImage && (
                    <div className="absolute bottom-4 left-4 right-4 py-2 glass rounded-xl text-center text-sm font-medium">
                      Mother
                    </div>
                  )}
                </div>

                {/* Father Input */}
                <div
                  onClick={() => fatherInputRef.current?.click()}
                  className={`relative h-56 md:h-64 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 ${fatherImage ? 'border-blue-300 bg-blue-50/30' : 'border-neutral-200 hover:border-blue-200 hover:bg-neutral-50/50'
                    }`}
                >
                  <input
                    type="file"
                    ref={fatherInputRef}
                    onChange={(e) => handleImageUpload(e, 'father')}
                    className="hidden"
                    accept="image/*"
                  />
                  {fatherImage ? (
                    <img src={fatherImage} alt="Father" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-blue-100 text-blue-500">
                        <Camera size={24} />
                      </div>
                      <span className="font-medium text-neutral-600">Upload Father's Photo</span>
                    </>
                  )}
                  {fatherImage && (
                    <div className="absolute bottom-4 left-4 right-4 py-2 glass rounded-xl text-center text-sm font-medium">
                      Father
                    </div>
                  )}
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-neutral-500 uppercase tracking-wider px-1">
                  Select Gender
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100/50 rounded-2xl border border-neutral-100">
                  {['boy', 'girl', 'surprise'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setGender(option as any)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${gender === option
                        ? 'bg-white text-pink-500 shadow-sm ring-1 ring-pink-100'
                        : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-center bg-red-50 py-3 rounded-xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <button
                onClick={generateBaby}
                disabled={isGenerating || !motherImage || !fatherImage}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-lg shadow-xl shadow-pink-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden relative"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" />
                    <span>Predicting the Future...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={22} />
                    <span>Generate Baby Photo</span>
                  </>
                )}
                {isGenerating && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                )}
              </button>
            </motion.div>

            {/* Visual Guide / Animation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex flex-col justify-center items-center p-12 glass rounded-3xl border-white/50 relative overflow-hidden"
            >
              <div className="relative z-10 text-center">
                <div className="mb-8 p-6 rounded-full bg-pink-100/50 inline-block animate-float">
                  <Heart className="text-pink-500 fill-pink-500" size={64} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Magic in the Making</h3>
                <p className="text-neutral-500 leading-relaxed">
                  Our advanced AI analyzes facial structure, eye shape, and genetic markers to create the most realistic prediction.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200/20 blur-3xl rounded-full" />
            </motion.div>
          </div>
        ) : (
          /* Result View */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto glass p-8 rounded-3xl border-white/50 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 font-medium mb-8">
              <Sparkles size={16} />
              <span>Generation Successful!</span>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-8 shadow-2xl ring-4 ring-pink-50">
              <img src={resultImage} alt="Generated Baby" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={reset}
                className="flex-1 py-4 rounded-xl bg-neutral-100 text-neutral-600 font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <a
                href={resultImage}
                download="my-ai-baby.jpg"
                className="flex-1 py-4 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-24 text-center text-neutral-400 text-sm pb-8">
        <p className="mb-2">© 2026 BabyStar AI • Professional Vision Model</p>
        <p>
          Built with ❤️ by{" "}
          <a
            href="https://x.com/its_aman_yadav"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 font-medium hover:underline"
          >
            Aman
          </a>
        </p>
      </footer>
    </main>
  );
}
