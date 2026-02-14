// Types for subject management

export interface Subject {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  documentCounts?: {
    syllabus: number;
    notes: number;
    pyq: number;
    textbook: number;
    total: number;
  };
}

export interface CreateSubjectPayload {
  name: string;
  description?: string;
}

export interface UpdateSubjectPayload {
  name?: string;
  description?: string;
}

export interface SubjectStats {
  totalSubjects: number;
  totalDocuments: number;
  subjectsWithDocuments: number;
  recentActivity: {
    subjectId: string;
    subjectName: string;
    lastDocumentDate: string;
  }[];
}
