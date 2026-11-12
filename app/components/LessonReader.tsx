import { ArrowRight, ExternalLink, MessageCircle } from 'lucide-react';
import type { LessonContent } from '../lessons/types';

type Props = {
  lesson: LessonContent;
  onQuestion: (question: string) => void;
  onPractice: () => void;
};

export function LessonReader({ lesson, onQuestion, onPractice }: Props) {
  const words = [...lesson.explanation, ...lesson.mechanism, ...lesson.example,
    lesson.use, lesson.caution, lesson.question, lesson.answer].join(' ').split(/\s+/).length;
  const sections = [
    ['meaning', 'The concept'], ['mechanism', 'How it works'],
    ['example', 'Worked example'], ['application', 'When to use it'],
    ['check', 'Check yourself'],
  ];
  const sectionId = (name: string) => `lesson-${lesson.id}-${name}`;

  return <article className="lesson-body lesson-reader" aria-label={`${lesson.title} lesson`}>
    <div className="learning-goal">
      <span className="eyebrow">WHAT YOU’LL LEARN · {Math.max(2, Math.ceil(words / 180))} MIN READ</span>
      <p>{lesson.scope}</p>
    </div>
    <nav className="lesson-outline" aria-label="Sections in this lesson">
      {sections.map(([name, label]) => <a key={name} href={`#${sectionId(name)}`}>{label}</a>)}
    </nav>
    <section id={sectionId('meaning')}>
      <h2>What this concept means</h2>
      {lesson.explanation.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </section>
    <section id={sectionId('mechanism')}>
      <h2>How it works</h2>
      {lesson.mechanism.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </section>
    <section id={sectionId('example')} className="worked-example">
      <span className="eyebrow">ILLUSTRATIVE SCENARIO</span>
      <h2>A realistic example, step by step</h2>
      <ol>{lesson.example.map((step, index) => <li key={index}>{step}</li>)}</ol>
    </section>
    <section id={sectionId('application')}>
      <h2>When and how to use it</h2>
      <p>{lesson.use}</p>
      <div className="lesson-distinction"><h3>A common misunderstanding</h3><p>{lesson.caution}</p></div>
    </section>
    <section id={sectionId('check')} className="lesson-self-check">
      <h2>Check your understanding</h2>
      <p>{lesson.question}</p>
      <p className="self-check-hint">Try answering in your own words before opening the explanation.</p>
      <details><summary>Reveal the explanation</summary><p>{lesson.answer}</p></details>
    </section>
    {lesson.sources.length > 0 && <div className="references">
      <span className="eyebrow">OPTIONAL READING · PRIMARY SOURCES</span>
      {lesson.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={13}/></a>)}
    </div>}
    <div className="lesson-next-steps">
      <button className="secondary" onClick={onPractice}>Try the module review<ArrowRight size={15}/></button>
      <button className="text-button" onClick={() => onQuestion(`I have a question about ${lesson.title}. `)}><MessageCircle size={15}/>Ask a question about this lesson</button>
    </div>
    <p className="optional-tutor-note">The tutor is optional. Use it if you want another explanation or have a question about what you’ve read.</p>
  </article>;
}
