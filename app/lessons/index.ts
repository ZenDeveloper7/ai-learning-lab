import type { LessonContent } from './types';
import module1 from './module-01.json';
import module2 from './module-02.json';
import module3 from './module-03.json';
import module4 from './module-04.json';
import module5 from './module-05.json';
import module6 from './module-06.json';
import module7 from './module-07.json';
import module8 from './module-08.json';
import module9 from './module-09.json';
import module10 from './module-10.json';
import module11 from './module-11.json';
import module12 from './module-12.json';
import module13 from './module-13.json';
import module14 from './module-14.json';
import module15 from './module-15.json';
import module16 from './module-16.json';
import module17 from './module-17.json';
import module18 from './module-18.json';
import module19 from './module-19.json';
import module20 from './module-20.json';

export const lessonContents: LessonContent[] = [...module1,...module2,...module3,...module4,...module5,...module6,...module7,...module8,...module9,...module10,...module11,...module12,...module13,...module14,...module15,...module16,...module17,...module18,...module19,...module20];
const byId = new Map(lessonContents.map(lesson => [lesson.id, lesson]));
export function getLessonContent(id: number): LessonContent {
  const lesson = byId.get(id);
  if (!lesson) throw new Error(`Missing lesson content: ${id}`);
  return lesson;
}
