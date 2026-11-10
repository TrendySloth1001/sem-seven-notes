// Ids for things a student can tick off. Kept client-safe so both server pages and client widgets build the same ids.
export const doneId = {
  unit: (subject: string, no: string) => `unit:${subject}/${no}`,
  note: (subject: string, topic: string) => `note:${subject}/${topic}`,
  question: (subject: string, paper: string, q: string) =>
    `q:${subject}/${paper}/${q}`,
};

export type SubjectItems = {
  units: string[];
  notes: string[];
  questions: string[];
};
