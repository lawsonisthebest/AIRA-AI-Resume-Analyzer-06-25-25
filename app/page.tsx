/* eslint-disable */
"use client";

import { Button } from "@/components/ui/button";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  FileText,
  Brain,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Upload,
  Download,
  ArrowRight,
  Sparkles,
  Clock,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
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
      {/* Features Section Skeleton */}
      <section className="py-20">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg w-1/3 mx-auto mb-4" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="text-center p-6 border border-white/20 rounded-lg animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-gray-700 rounded-lg w-1/2 mx-auto mb-2" />
              <div className="h-4 bg-gray-700 rounded-lg w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </section>
      {/* Stats Section Skeleton */}
      <section className="py-20">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg w-1/3 mx-auto mb-4" />
        </div>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-6 border border-white/20 rounded-lg animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-gray-700 rounded-lg w-1/2 mx-auto mb-2" />
              <div className="h-4 bg-gray-700 rounded-lg w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </section>
      {/* How It Works Section Skeleton */}
      <section className="py-20">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg w-1/3 mx-auto mb-4" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="text-center p-6 border border-white/20 rounded-lg animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-gray-700 rounded-lg w-1/2 mx-auto mb-2" />
              <div className="h-4 bg-gray-700 rounded-lg w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </section>
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

  const goToPage = (pgName: string) => {
    router.push(`/${pgName}`);
  };
  return (
    <div className="text-white max-w-7xl w-full mx-auto p-6">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          AIRA - Resume Analyzer
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Transform your resume with AI-powered insights. Get personalized
          feedback, keyword optimization, and professional recommendations to
          land your dream job.
        </p>
        <div>
          {isSignedIn ? (
            <div className="gap-4 flex justify-center">
              <Button
                className="headerBtn text-lg px-8 py-3"
                onClick={() => {
                  goToPage("analyze");
                }}
              >
                <FileText className="mr-2" />
                Analyze Resume
              </Button>
              <Button className="headerBtn text-lg px-8 py-3">
                <Brain className="mr-2" />
                Learn More
              </Button>
            </div>
          ) : (
            <div className="gap-4 flex justify-center">
              <SignInButton>
                <Button className="headerBtn text-lg px-8 py-3">
                  <User className="mr-2" />
                  Sign In
                </Button>
              </SignInButton>
              <Button className="headerBtn text-lg px-8 py-3">
                <Brain className="mr-2" />
                Learn More
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Why Choose AIRA?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Zap className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-2xl font-semibold mb-4">Lightning Fast</h3>
            <p className="text-gray-300">
              Get comprehensive resume analysis in seconds, not hours. Our AI
              processes your document instantly.
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Brain className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h3 className="text-2xl font-semibold mb-4">AI-Powered Insights</h3>
            <p className="text-gray-300">
              Advanced machine learning algorithms provide personalized feedback
              and optimization suggestions.
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Shield className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-2xl font-semibold mb-4">Secure & Private</h3>
            <p className="text-gray-300">
              Your data is encrypted and secure. We never share your personal
              information with third parties.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Our Impact:</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <FileText className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
            <div className="text-gray-300">Resumes Analyzed</div>
          </div>
          <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
            <div className="text-gray-300">Success Rate</div>
          </div>
          <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Users className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <div className="text-4xl font-bold text-purple-400 mb-2">50K+</div>
            <div className="text-gray-300">Happy Users</div>
          </div>
          <div className="p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Clock className="w-12 h-12 mx-auto mb-4 text-orange-400" />
            <div className="text-4xl font-bold text-orange-400 mb-2">24/7</div>
            <div className="text-gray-300">AI Support</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">How It Works:</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Upload Resume</h3>
            <p className="text-gray-300">
              Simply upload your resume in PDF, DOC, or DOCX format. Our system
              supports all major file types.
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
            <p className="text-gray-300">
              Our advanced AI analyzes your resume for content, formatting,
              keywords, and industry best practices.
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Get Results</h3>
            <p className="text-gray-300">
              Receive detailed feedback, suggestions, and an optimized version
              of your resume ready for applications.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="bg-gradient-to-r from-white/5 to-white/10 p-12 rounded-2xl border border-white/20">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already improved their
            resumes and landed their dream jobs with AI Resume Analyzer.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="headerBtn text-lg px-8 py-3">
              <TrendingUp className="mr-2" />
              Start Free Analysis
            </Button>
            <Button className="headerBtn text-lg px-8 py-3">
              <Users className="mr-2" />
              View Success Stories
            </Button>
          </div>
          <div className="flex items-center justify-center mt-8 text-gray-400">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            <span>Free analysis • No credit card required</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </div>
      </section>
    </div>
  );
}
