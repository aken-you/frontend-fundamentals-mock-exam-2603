export const EQUIPMENT_LABELS: Record<string, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

export const ALL_EQUIPMENT = ['tv', 'whiteboard', 'video', 'speaker'] as const;

export const MIN_ATTENDEES = 1;

export const TIME_SLOTS: string[] = [];
const START_HOUR = 9;
const END_HOUR = 20;
for (let h = START_HOUR; h <= END_HOUR; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < END_HOUR) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
  }
}
