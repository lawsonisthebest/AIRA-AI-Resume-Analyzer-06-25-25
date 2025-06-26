/* eslint-disable */
"use client";

import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import React, { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import ResumeCard from "@/components/ResumeCard";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  TrendingUp,
  Clock,
  FileText,
  ChartPie,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { fetchAllResumes } from "@/lib/utils";

function page() {
  const { user, isLoaded } = useUser();
  const [resumes, setResumes] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setResumes([]);
      setLoading(false);
      return;
    }
    async function loadResumes() {
      setLoading(true);
      try {
        const all = await fetchAllResumes(user?.id ?? "");
        setResumes(all);
      } catch (error) {
        console.error("Error fetching resumes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadResumes();
  }, [user, isLoaded]);

  // Filter and sort resumes
  const filteredAndSortedResumes = useMemo(() => {
    if (!resumes) return [];

    let filtered = resumes.filter((resume) => {
      const matchesSearch =
        resume.analysis.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        resume.analysis.summary
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "excellent" && resume.analysis.score >= 80) ||
        (scoreFilter === "good" &&
          resume.analysis.score >= 60 &&
          resume.analysis.score < 80) ||
        (scoreFilter === "fair" &&
          resume.analysis.score >= 40 &&
          resume.analysis.score < 60) ||
        (scoreFilter === "poor" && resume.analysis.score < 40);

      return matchesSearch && matchesScore;
    });

    // Sort resumes
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "score":
          aValue = a.analysis.score;
          bValue = b.analysis.score;
          break;
        case "title":
          aValue = a.analysis.title.toLowerCase();
          bValue = b.analysis.title.toLowerCase();
          break;
        case "date":
        default:
          aValue = a.timestamp || 0;
          bValue = b.timestamp || 0;
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [resumes, searchTerm, scoreFilter, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!resumes) return null;

    const total = resumes.length;
    const avgScore =
      resumes.reduce((sum, r) => sum + r.analysis.score, 0) / total;
    const excellentCount = resumes.filter((r) => r.analysis.score >= 80).length;
    const goodCount = resumes.filter(
      (r) => r.analysis.score >= 60 && r.analysis.score < 80
    ).length;
    const fairCount = resumes.filter(
      (r) => r.analysis.score >= 40 && r.analysis.score < 60
    ).length;
    const poorCount = resumes.filter((r) => r.analysis.score < 40).length;

    return { total, avgScore, excellentCount, goodCount, fairCount, poorCount };
  }, [resumes]);

  const isEmpty = resumes && resumes.length === 0;
  const hasFilteredResults = filteredAndSortedResumes.length > 0;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="text-white max-w-7xl w-full mx-auto p-6">
      {/* Hero Section Skeleton */}
      <section className="text-center py-10">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-700 rounded-lg mb-6 max-w-2xl mx-auto"></div>
          <div className="h-6 bg-gray-700 rounded-lg mb-8 max-w-3xl mx-auto"></div>
        </div>
      </section>

      {/* Resume Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="border border-white/20 rounded-lg p-6 animate-pulse"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                <div>
                  <div className="h-5 bg-gray-700 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-700 rounded w-12"></div>
            </div>

            {/* Score Section */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-6 bg-gray-700 rounded w-12"></div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-1"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-700 rounded w-4"></div>
                <div className="h-3 bg-gray-700 rounded w-4"></div>
                <div className="h-3 bg-gray-700 rounded w-4"></div>
                <div className="h-3 bg-gray-700 rounded w-4"></div>
                <div className="h-3 bg-gray-700 rounded w-4"></div>
              </div>
            </div>

            {/* Content Lines */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-5/6"></div>
              <div className="h-3 bg-gray-700 rounded w-4/6"></div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
              <div className="h-4 bg-gray-700 rounded w-20"></div>
              <div className="h-8 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading || !isLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="text-white max-w-7xl w-full mx-auto p-6">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Your Resume Collection
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          All your analyzed resumes in one place. View, compare, and manage your
          AI-powered resume insights.
        </p>
      </section>

      {/* Search and Filter Controls */}
      {!isEmpty && (
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex gap-4 items-center">
              {/* Score Filter */}
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Scores</option>
                  <option value="excellent">Excellent (80%+)</option>
                  <option value="good">Good (60-79%)</option>
                  <option value="fair">Fair (40-59%)</option>
                  <option value="poor">Poor (&lt;40%)</option>
                </select>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-900 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="score">Score</option>
                  <option value="title">Title</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 bg-zinc-900 border border-white/20 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  {sortOrder === "asc" ? (
                    <SortAsc size={20} />
                  ) : (
                    <SortDesc size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredAndSortedResumes.length} of {resumes?.length}{" "}
            resumes
            {searchTerm && ` matching "${searchTerm}"`}
            {scoreFilter !== "all" && ` with ${scoreFilter} scores`}
          </div>
        </section>
      )}

      {/* Resume Grid or Empty State */}
      {!resumes || resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <img
            src="/file.svg"
            alt="No resumes"
            className="w-20 h-20 mb-6 opacity-60"
          />
          <h2 className="text-2xl font-semibold mb-2">No resumes found</h2>
          <p className="text-gray-400 mb-6 max-w-md text-center">
            You haven't analyzed any resumes yet. Start by uploading or pasting
            your resume to get instant AI feedback!
          </p>
          <a href="/analyze">
            <Button variant={"outline"} className="text-lg bg-transparent">
              Analyze Resume
            </Button>
          </a>
        </div>
      ) : !hasFilteredResults ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Search className="w-16 h-16 mb-6 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-2">No matching resumes</h2>
          <p className="text-gray-400 mb-6 max-w-md text-center">
            Try adjusting your search terms or filters to find what you're
            looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setScoreFilter("all");
            }}
            className="headerBtn text-lg px-8 py-3"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredAndSortedResumes.map((resume) => (
            <ResumeCard key={resume.id} data={resume.analysis} id={resume.id} />
          ))}
        </div>
      )}

      {/* Quick Actions Footer */}
      {!isEmpty && (
        <section className="mt-16 pt-8 border-t border-white/10">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2">Quick Actions</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Analyze a new resume or reset your current filters to view all
              resumes in your collection.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/analyze">
                <Button className="headerBtn px-6 py-2">
                  <ChartPie />
                  Analyze New
                </Button>
              </a>
              <Button
                className="headerBtn px-6 py-2"
                onClick={() => {
                  setSearchTerm("");
                  setScoreFilter("all");
                  setSortBy("date");
                  setSortOrder("desc");
                }}
              >
                <Search />
                Clear Filters
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
export default page;
