// Types for document management

export interface Document {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  documentType: "syllabus" | "notes" | "pyq" | "textbook";
  subjectId: string;
  userId: string;
  uploadedAt: string;
  status: "processing" | "completed" | "failed";
  processedAt?: string;
  errorMessage?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
    summary?: string;
    keyTopics?: string[];
  };
}

export interface DocumentStats {
  totalDocuments: number;
  documentsByType: {
    syllabus: number;
    notes: number;
    pyq: number;
    textbook: number;
  };
  recentUploads: {
    documentId: string;
    documentName: string;
    documentType: string;
    subjectName: string;
    uploadedAt: string;
  }[];
  storageUsed: number;
  processingStatus: {
    processing: number;
    completed: number;
    failed: number;
  };
}

export interface UploadDocumentPayload {
  file: File;
  subjectId: string;
  documentType?: "syllabus" | "notes" | "pyq" | "textbook";
}

export interface DocumentFilters {
  subjectId?: string;
  documentType?: "syllabus" | "notes" | "pyq" | "textbook";
  status?: "processing" | "completed" | "failed";
  search?: string;
  sortBy?: "uploadedAt" | "name" | "size";
  sortOrder?: "asc" | "desc";
}
