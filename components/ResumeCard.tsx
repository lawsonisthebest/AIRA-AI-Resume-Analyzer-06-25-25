/* eslint-disable */
import React, { useState } from "react";
import { CheckCircle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ResumeAnalysis {
  score: number;
  summary: string;
  key_points?: string | string[];
  feedback: string;
  original: string;
  title: string;
}

type ResumeCardProps = {
  id: string;
  data: ResumeAnalysis;
};
export async function deleteResume(docId: string) {
  try {
    await deleteDoc(doc(db, "resumes", docId));
    console.log("Document deleted successfully");
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}

function ResumeCard({ id, data }: ResumeCardProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const goToPage = () => {
    router.push(`/analyze/${id}`);
  };
  function renderBold(text: string) {
    if (!text) return "";
    // Replace **text** with <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  }

  return (
    <div className="relative bg-zinc-900 rounded-xl shadow-md border p-4 border-white/10 max-w-xs w-full flex flex-col gap-2 mb-3 hover:scale-[1.02] transition-transform duration-200">
      {/* Score badge at top right */}
      <div
        className={`absolute top-0 right-0 py-1  rounded-tr-xl rounded-bl-xl ${
          data.score < 25 ? "bg-red-600" : ""
        } ${data.score < 50 && data.score > 24 ? "bg-blue-600" : ""}
        ${data.score < 75 && data.score > 49 ? "bg-orange-400" : ""}
        ${data.score < 101 && data.score > 74 ? "bg-green-600" : ""}
        }`}
      >
        <span className="px-4 font-black">{data.score}%</span>
      </div>
      <h3 className="text-base font-semibold flex items-center gap-1 truncate mt-1">
        <CheckCircle className="text-green-400" size={16} />
        <span
          dangerouslySetInnerHTML={{
            __html: renderBold(data.title),
          }}
          style={{
            fontFamily: "inherit",
            whiteSpace: "pre-wrap",
            fontWeight: "bold",
          }}
        />
      </h3>
      <p
        className="text-sm text-zinc-100 leading-snug line-clamp-3"
        title={data.summary}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: renderBold(data.summary),
          }}
          style={{ fontFamily: "inherit", whiteSpace: "pre-wrap" }}
        />
      </p>
      <div className="flex justify-center items-center gap-2">
        <Button
          variant={"outline"}
          className="bg-transparent flex-1"
          onClick={goToPage}
        >
          View Details
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <span>
              <Button
                variant={"outline"}
                className="bg-transparent text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => setIsDialogOpen(true)}
              >
                <Trash2 />
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
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  deleteResume(id);
                  router.push("/");
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
      </div>
    </div>
  );
}

export default ResumeCard;
