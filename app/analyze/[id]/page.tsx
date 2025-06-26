/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import {
  AlertCircle,
  FileText,
  TrendingUp,
  Star,
  Zap,
  Target,
  Trash2,
  Calendar,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";

async function getResumeScoreById(docId: string) {
  const docRef = doc(db, "resumes", docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log(data);

    // Fetch user's plan from users collection
    let userPlan = null;
    if (data.userId) {
      try {
        const userDocRef = doc(db, "users", data.userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          userPlan = userData.plan || null;
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
      }
    }

    return { ...data, userPlan };
  } else {
    console.warn("No such document!");
    return null;
  }
}

// Utility function to render **bold** text as <strong>bold</strong>
function renderBold(text: string) {
  if (!text) return "";
  // Replace **text** or *text* with <strong>text</strong>
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>");
}

// Utility function to count words in a string
function getWordCount(text: string | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function AnalyzeResultPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const docId = params.id; // This is your document ID from the URL
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    async function fetchScore() {
      if (typeof docId === "string") {
        setLoading(true);
        try {
          const result = await getResumeScoreById(docId);
          setData(result);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchScore();
  }, [docId]);

  useEffect(() => {
    if (!userLoaded || loading) return;
    if (data && user && data.userId && data.userId !== user.id) {
      router.push("/");
    }
  }, [data, user, userLoaded, loading, router]);

  const handleDownload = (txt: string, title: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxLineWidth = pageWidth - margin * 2;

    // Split text into lines that fit within the page width
    const lines = doc.splitTextToSize(txt, maxLineWidth);

    // Add the wrapped text to the PDF
    doc.text(lines, margin, margin);

    // Save the PDF with a filename
    doc.save(title + ".pdf");
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="text-white max-w-7xl w-full mx-auto p-6">
      {/* Hero Section Skeleton */}
      <section className="text-center py-20">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-700 rounded-lg mb-6 max-w-2xl mx-auto"></div>
          <div className="h-6 bg-gray-700 rounded-lg mb-8 max-w-3xl mx-auto"></div>
          <div className="h-12 bg-gray-700 rounded-lg w-48 mx-auto"></div>
        </div>
      </section>

      {/* Score Dashboard Skeleton */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Score Card Skeleton */}
          <div className="lg:col-span-1">
            <div className="border border-white/20 rounded-lg p-6 h-full animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div>
                    <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-10 bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-700 rounded w-4"></div>
                  <div className="h-3 bg-gray-700 rounded w-4"></div>
                  <div className="h-3 bg-gray-700 rounded w-4"></div>
                  <div className="h-3 bg-gray-700 rounded w-4"></div>
                  <div className="h-3 bg-gray-700 rounded w-4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="lg:col-span-2">
            <div className="border border-white/20 rounded-lg p-6 h-full animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-32 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Sections Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-6 border border-white/20 rounded-lg animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-700 rounded w-48"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Section Skeleton */}
      <section className="mb-12">
        <div className="p-6 border border-white/20 rounded-lg animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-700 rounded w-64"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </section>

      {/* Original Resume Skeleton */}
      <section>
        <div className="p-6 border border-white/20 rounded-lg animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-700 rounded w-40"></div>
          </div>
          <div className="bg-black/50 rounded-lg p-4 border border-white/10">
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  if (loading || !userLoaded) {
    return <LoadingSkeleton />;
  }

  // Extract plan from database data
  const plan = data?.userPlan || null;

  const deleteResume = async () => {
    if (typeof docId !== "string") {
      toast.error("Invalid document ID.");
      return;
    }
    const docRef = doc(db, "resumes", docId);

    try {
      await deleteDoc(docRef);
      toast.success("Resume deleted successfully!");
      router.push("/collection");
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
      console.error(error);
    }
  };

  return (
    <div className="text-white max-w-7xl w-full mx-auto p-6">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Resume Analysis Results
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Here are your AI-powered resume insights and feedback.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <span>
              <Button
                variant="outline"
                className="bg-transparent text-red-500 border-red-500 hover:text-white hover:bg-red-500"
                onClick={() => setIsDialogOpen(true)}
              >
                <Trash2 />
                Delete Resume
              </Button>
            </span>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900/95 backdrop-blur border border-white/10 shadow-2xl p-8">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold">
                Are you sure you want to delete this resume?
              </DialogTitle>
              <DialogDescription className="text-zinc-300">
                This action cannot be undone. This will permanently delete your
                resume and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={async () => {
                  await deleteResume();
                  setIsDialogOpen(false);
                }}
                className="flex-1 border-red-400 bg-transparent text-red-400 hover:bg-red-400 hover:text-white"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-white bg-transparent text-white hover:bg-white hover:text-black"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Score Dashboard */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Score Card */}
          <div className="lg:col-span-1">
            <div className="border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300 p-6 h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Overall Score
                    </h3>
                    <p className="text-gray-400 text-sm">Resume Analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-400">
                    {data?.analysis?.score}
                  </div>
                  <div className="text-gray-400 text-sm">out of 100</div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Performance Level</span>
                  <span className="text-green-400 font-medium">
                    {data?.analysis?.score >= 90
                      ? "Excellent"
                      : data?.analysis?.score >= 80
                      ? "Very Good"
                      : data?.analysis?.score >= 70
                      ? "Good"
                      : data?.analysis?.score >= 60
                      ? "Fair"
                      : "Needs Improvement"}
                  </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${data?.analysis?.score}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300 p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-6">
                Analysis Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Sentiment</div>
                    <div className="text-xl font-semibold text-green-400">
                      {data?.analysis?.sentiment}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Date</div>
                    <div className="text-xl font-semibold text-purple-400">
                      {data?.createdAt
                        ? new Date(data.createdAt.toDate()).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Word Count</div>
                    <div className="text-xl font-semibold text-blue-400">
                      {data?.resume
                        ? `${getWordCount(data.resume)} words`
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Suggestions</div>
                    <div className="text-xl font-semibold text-teal-400">
                      {Array.isArray(data?.analysis?.improvements)
                        ? `${data.analysis.improvements.length} items`
                        : "0 items"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Sections */}
      <div
        className={`${
          plan !== "Free Plan"
            ? "grid grid-cols-1 lg:grid-cols-2 gap-8 "
            : "w-full"
        } mb-12`}
      >
        {/* Summary */}
        <div
          className={`p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300`}
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Executive Summary</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            <span
              dangerouslySetInnerHTML={{
                __html: renderBold(data?.analysis?.summary),
              }}
              style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
            />
          </p>
        </div>

        {/* Key Points */}
        {plan !== "Free Plan" && (
          <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Key Highlights</h2>
            </div>
            <ul className="space-y-2">
              {data?.analysis?.key_point?.map((point: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span
                    dangerouslySetInnerHTML={{ __html: renderBold(point) }}
                    style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Successes and Mistakes Sections */}
      {plan !== "Free Plan" && (
        <div
          className={`${
            plan !== "Pro Plan"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-8 "
              : "w-full"
          } mb-12`}
        >
          {/* Successes */}
          {plan !== "Pro Plan" && (
            <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold text-white">
                  What You Did Well
                </h2>
              </div>
              <ul className="space-y-2">
                {data?.analysis?.success?.map((success: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span
                      dangerouslySetInnerHTML={{ __html: renderBold(success) }}
                      style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                    />
                  </li>
                ))}
                {(!data?.analysis?.success ||
                  data.analysis.success.length === 0) && (
                  <li className="text-gray-500 italic">
                    No specific successes identified.
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Mistakes */}
          <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
              <h2 className="text-2xl font-bold text-white">
                Areas of Concern
              </h2>
            </div>
            <ul className="space-y-2">
              {data?.analysis?.mistakes?.map((mistake: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span
                    dangerouslySetInnerHTML={{ __html: renderBold(mistake) }}
                    style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                  />
                </li>
              ))}
              {(!data?.analysis?.mistakes ||
                data.analysis.mistakes.length === 0) && (
                <li className="text-gray-500 italic">
                  No specific concerns identified.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <section className="mb-12">
        <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">
              Improvement Suggestions
            </h2>
          </div>
          <ol className="text-gray-300 leading-relaxed space-y-1">
            {data?.analysis?.improvements?.map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <span
                  dangerouslySetInnerHTML={{ __html: renderBold(point) }}
                  style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Original Resume */}
      <section>
        <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
          <div className="flex justify-between">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Original Resume</h2>
            </div>
            {plan !== "Free Plan" && (
              <div>
                <Button
                  variant={"outline"}
                  className="bg-transparent opacity-60 hover:opacity-100"
                  onClick={() => {
                    handleDownload(data?.resume, "Original_Resume");
                  }}
                >
                  <Upload width={14} height={14} />
                </Button>
              </div>
            )}
          </div>
          <div className="bg-black/50 rounded-lg p-4 border border-white/10">
            <pre
              className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono"
              style={{ all: "unset" }}
            >
              <span
                style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: renderBold(data?.resume) }}
              />
            </pre>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
          <div className="flex justify-between">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Revised Resume</h2>
            </div>
            {plan !== "Free Plan" && (
              <div>
                <Button
                  variant={"outline"}
                  className="bg-transparent opacity-60 hover:opacity-100"
                  onClick={() => {
                    handleDownload(
                      data?.analysis?.rewriten_resume,
                      "New_Resume"
                    );
                  }}
                >
                  <Upload width={14} height={14} />
                </Button>
              </div>
            )}
          </div>
          <div className="bg-black/50 rounded-lg p-4 border border-white/10">
            <pre
              className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono"
              style={{ all: "unset" }}
            >
              <span
                style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{
                  __html: renderBold(data?.analysis?.rewriten_resume),
                }}
              />
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
