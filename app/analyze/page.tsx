/* eslint-disable */
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Copy, Check, X, AlertCircle } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { resetMonthlyCreditsIfNeeded } from "@/lib/uploadLimits";
import { updateUserTokens, getUserTokens } from "@/lib/utils";
import mammoth from "mammoth";

interface FileWithPreview extends File {
  preview?: string;
}

// Helper to format file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function AnalyzePage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputMethod, setInputMethod] = useState<"file" | "text">("file");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState(3);
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState(true);

  // State for pdfjs modules (lazy load on client)

  useEffect(() => {
    if (user.user?.id) {
      resetMonthlyCreditsIfNeeded(user.user.id);
    }
    async function fetchUploads() {
      if (user.user?.id) {
        const tokens = await getUserTokens(user.user.id);
        if (tokens !== null) setUploads(tokens);
      }
    }
    fetchUploads();
  }, [user.user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Extract text from PDF (only after pdfjs loaded)
  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      setError(
        `Invalid file type: ${file.name}. Please upload PDF, DOC, DOCX, or TXT files.`
      );
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        `File too large: ${file.name}. Please upload files smaller than 10MB.`
      );
      return false;
    }

    return true;
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // @ts-ignore: No types for pdfjs-dist/build/pdf in dynamic import
    const pdfjsLib: any = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"; // Use local worker
    const arrayBuffer = await file.arrayBuffer();
    const pdf: any = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      let pageText = "";
      let lastY: number | null = null;
      (content.items as any[]).forEach((item: any) => {
        if (lastY !== null && item.transform[5] !== lastY) {
          pageText += "\n";
        }
        pageText += item.str;
        lastY = item.transform[5];
      });
      text += pageText + "\n\n";
    }
    return text;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  const extractTextFromTxt = async (file: File): Promise<string> => {
    return await file.text();
  };

  const handleFilesToText = useCallback(async (files: File[]) => {
    let allText = "";
    for (const file of files) {
      if (file.type === "application/pdf") {
        allText += await extractTextFromPDF(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        allText += await extractTextFromDocx(file);
      } else if (file.type === "text/plain") {
        allText += await extractTextFromTxt(file);
      } else {
        // fallback: skip unsupported
        continue;
      }
      allText += "\n\n";
    }
    setResumeText(allText.trim());
    setInputMethod("text");
  }, []);

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      setError(null);
      const validFiles = newFiles.filter(validateFile);
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        await handleFilesToText(validFiles);
      }
    },
    [handleFilesToText]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      addFiles(selectedFiles);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, [resumeText]);

  useEffect(() => {
    if (resumeText.length > 0 && inputMethod === "file") {
      setInputMethod("text");
    }
  }, [resumeText]);

  async function analyzeTextWithGemini(userInput: string) {
    const res = await fetch("/api/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: userInput,
        userId: user.user?.id,
      }),
    });

    const data = await res.json();
    console.log("API response:", data);

    return data; // includes analysis and doc_id
  }

  const handleAnalyze = useCallback(async () => {
    const getCurrentDateString = () => {
      return new Date().toLocaleString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };
    if (uploads !== -1 && uploads < 1) {
      toast.error(
        "You do not have enough uploads! Upgrade your account to continue."
      );
      router.push("/pricing");
      return;
    }
    if (inputMethod === "file" && files.length === 0) {
      setError("Please select at least one file to analyze");
      toast.error("An error occured! Please try again.", {
        description: getCurrentDateString(),
      });
      return;
    }
    if (inputMethod === "text" && !resumeText.trim()) {
      setError("Please enter resume text to analyze");
      toast.error("An error occured! Please try again.", {
        description: getCurrentDateString(),
      });
      return;
    }
    setError(null);
    setIsLoading(true);
    console.log("Analyzing resume...", { files, resumeText, inputMethod });
    const loadingToastId = toast.loading("Analyzing resume, please wait...", {
      description: getCurrentDateString(),
    });
    const result = await analyzeTextWithGemini(resumeText);
    setIsLoading(false);
    console.log(result); // or display it in the UI
    setResumeText("");
    // ✅ Defensive check
    toast.dismiss(loadingToastId);
    toast.success("Resume successfully analyzed!", {
      description: getCurrentDateString(),
    });
    updateUserTokens(user.user?.id!);
    router.push(`/collection`);
  }, [files, resumeText, inputMethod, user.user?.id]);

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="text-white max-w-7xl w-full mx-auto p-6">
      {/* Hero Section Skeleton */}
      <section className="text-center py-20">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="h-16 bg-gray-700 rounded-lg mb-4 w-2/3 max-w-xl" />
          <div className="h-6 bg-gray-700 rounded-lg w-1/2 max-w-md" />
        </div>
      </section>
      {/* Input Method Toggle Skeleton */}
      <div className="flex justify-center mb-8 animate-pulse">
        <div className="border border-white/20 rounded-lg gap-1 p-1 flex w-80 h-12 bg-gray-700" />
      </div>
      {/* File/Text Input Skeleton */}
      <div className="space-y-6 animate-pulse">
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-700" />
        <div className="border border-white/20 rounded-lg p-6 bg-gray-700" />
      </div>
      {/* CTA Section Skeleton */}
      <section className="py-20 text-center">
        <div className="bg-gradient-to-r from-white/5 to-white/10 p-12 rounded-2xl border border-white/20 flex flex-col items-center animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg w-1/3 mb-6" />
          <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-8" />
          <div className="h-10 bg-gray-700 rounded-lg w-1/4 mb-4" />
          <div className="h-4 bg-gray-700 rounded-lg w-1/3 mt-8" />
        </div>
      </section>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="text-white max-w-7xl w-full mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <section className="text-center py-20">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            AIRA Analyzer
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload your resume or paste the content below to get AI-powered
            insights, and tips personalized to fit your expectations!
          </p>
        </section>

        {/* Input Method Toggle */}
        <div className="flex justify-center mb-8">
          <div className="border border-white/20 rounded-lg gap-1 p-1 flex">
            <Button
              variant={inputMethod === "file" ? "default" : "ghost"}
              onClick={() => setInputMethod("file")}
              className={
                inputMethod === "file"
                  ? "border-1 border-white"
                  : "text-gray-600 hover:bg-transparent hover:text-white"
              }
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button
              variant={inputMethod === "text" ? "default" : "ghost"}
              onClick={() => setInputMethod("text")}
              className={
                inputMethod === "text"
                  ? "border-1 border-white"
                  : "text-gray-600  hover:bg-transparent hover:text-white"
              }
            >
              <FileText className="w-4 h-4 mr-2" />
              Paste Text
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* File Upload Section */}
        {inputMethod === "file" && (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                isDragOver
                  ? "border-blue-400 bg-white/5 scale-105"
                  : "border-white/20 hover:border-white/40 hover:bg-white/5"
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleDropZoneClick}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                  isDragOver ? "text-blue-400" : "text-gray-400"
                }`}
              />
              <h3 className="text-xl font-semibold text-white mb-2">
                {isDragOver ? "Drop files here" : "Drop your resume here"}
              </h3>
              <p className="text-gray-300 mb-4">
                or click to browse files (PDF, DOC, DOCX, TXT)
              </p>
              <p className="text-gray-400 text-sm">
                Maximum file size: 10MB per file
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Selected Files ({files.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFiles}
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-gray-300 text-sm">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Input Section */}
        {inputMethod === "text" && (
          <div className="space-y-6">
            <div className="border border-white/20 rounded-lg p-6 hover:border-white/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Paste Your Resume
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here... You can include sections like Education, Experience, Skills, etc."
                className="w-full h-64 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-300 text-sm">
                  {resumeText.length} characters
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResumeText("")}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleAnalyze}
            size="lg"
            className="headerBtn text-lg px-8 py-3"
            disabled={
              (inputMethod === "file" && files.length === 0) ||
              (inputMethod === "text" && !resumeText.trim()) ||
              isLoading
            }
          >
            {!isLoading ? "Analyze Resume" : "Loading..."}
          </Button>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 text-blue-200 font-semibold text-sm shadow-sm border border-blue-400/30">
              <Upload className="w-4 h-4" />
              Uploads Left:{" "}
              <span className="font-bold">
                {uploads === -1 ? "Unlimited" : uploads}
              </span>
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Multiple Formats
            </h3>
            <p className="text-gray-300">
              Support for PDF, DOC, DOCX, and plain text files
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Easy Upload
            </h3>
            <p className="text-gray-300">
              Drag and drop or click to upload your resume files
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Text Input
            </h3>
            <p className="text-gray-300">
              Paste your resume content directly for quick analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
