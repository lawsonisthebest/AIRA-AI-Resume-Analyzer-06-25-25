/* eslint-disable */
"use client";

import PricingCard from "@/components/PricingCard";
import React, { useState, useEffect } from "react";
import {
  Zap,
  Shield,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Globe,
} from "lucide-react";

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes! You can cancel your subscription at any time from your account dashboard. Your plan will remain active until the end of the billing cycle.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit cards, Apple Pay, Google Pay, Paypall, and more!",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All your data is encrypted and never shared with third parties.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "If you're not satisfied, contact us within 7 days for a full refund.",
  },
];

export default function page() {
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
      <section className="py-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="text-center p-6 border border-white/20 rounded-lg animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-gray-700 rounded-lg w-1/2 mx-auto mb-2" />
              <div className="h-4 bg-gray-700 rounded-lg w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </section>
      {/* Pricing Cards Skeleton */}
      <section className="py-20">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-700 rounded-lg w-1/2 mx-auto" />
        </div>
        <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border border-white/20 rounded-lg p-8 w-72 animate-pulse"
            >
              <div className="h-6 bg-gray-700 rounded-lg w-1/2 mx-auto mb-4" />
              <div className="h-10 bg-gray-700 rounded-lg w-1/3 mx-auto mb-6" />
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 bg-gray-700 rounded w-2/3 mx-auto"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* FAQ Section Skeleton */}
      <section className="py-20 border-t border-white/10">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-8 bg-gray-700 rounded-lg w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-700 rounded-lg w-1/2 mx-auto" />
        </div>
        <div className="max-w-3xl mx-auto grid gap-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/80 border border-white/10 rounded-xl p-6 shadow-md animate-pulse"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full" />
                <div className="h-5 bg-gray-700 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      </section>
      {/* Call to Action Skeleton */}
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
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="flex flex-col items-center justify-center gap-6">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Choose the plan that fits your needs. No hidden fees. Cancel
            anytime.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Zap className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-2xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-300">
              Get instant, actionable feedback on your resume using advanced AI
              algorithms.
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Shield className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-2xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-300">
              Your data is encrypted and never shared. Privacy and security are
              our top priorities.
            </p>
          </div>
          <div className="text-center p-6 border border-white/20 rounded-lg hover:border-white/40 transition-all duration-300">
            <Users className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h3 className="text-2xl font-semibold mb-2">For Everyone</h3>
            <p className="text-gray-300">
              Flexible plans for students, professionals, and enterprises.
              Upgrade or downgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            All plans include unlimited access to AI-powered resume analysis and
            priority support.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
          <PricingCard
            name="Free Plan"
            price={0}
            uploads={3}
            benefits={[
              "3 Uploads Per Month",
              "Basic AI Analysis",
              "Viewable Analysis",
            ]}
            isPopular={false}
          />
          <PricingCard
            name="Pro Plan"
            uploads={25}
            price={6}
            benefits={[
              "25 Uploads Per Month",
              "Downloadable Resumes",
              "Visualize Mistakes",
            ]}
            isPopular={true}
          />
          <PricingCard
            name="Enterprise Plan"
            price={10}
            uploads={Infinity}
            benefits={[
              "Unlimited Uploads",
              "Advanced AI Feedback",
              "Visualize Success",
            ]}
            isPopular={false}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Still have questions? We have answers.
          </p>
        </div>
        <div className="max-w-3xl mx-auto grid gap-8">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-zinc-900/80 border border-white/10 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-green-400 w-6 h-6" />
                <h3 className="text-xl font-semibold">{faq.question}</h3>
              </div>
              <p className="text-gray-300 text-base">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 text-center">
        <div className="bg-gradient-to-r from-white/5 to-white/10 p-12 rounded-2xl border border-white/20 flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Upgrade Your Resume?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their careers with
            AI Resume Analyzer.
          </p>
          <a href="/analyze">
            <button className="headerBtn text-lg px-8 py-3 flex items-center gap-2 rounded-lg">
              <FileText className="w-5 h-5 mr-2" />
              Start Free Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </a>
          <div className="flex items-center justify-center mt-8 text-gray-400">
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
            <span>Free analysis • No credit card required</span>
          </div>
        </div>
      </section>
    </div>
  );
}
