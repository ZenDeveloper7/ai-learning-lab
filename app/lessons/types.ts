export type LessonContent = {
  id: number;
  title: string;
  scope: string;
  explanation: string[];
  mechanism: string[];
  example: string[];
  use: string;
  caution: string;
  question: string;
  answer: string;
  sources: { label: string; url: string }[];
};
