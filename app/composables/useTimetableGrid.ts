import { computed, type ComputedRef } from "vue";
import type { Day } from "~~/server/models/Course";

export interface TimetableEvent {
  id: string | number;
  title: string;
  subtitle?: string;
  day: Day;
  startTime: string; // Format: "08:00"
  endTime: string; // Format: "09:30"
  color?: string;
}

interface TimetableRange {
  startMinutes: number;
  endMinutes: number;
  totalMinutes: number;
}

interface PositionedTimetableEvent extends TimetableEvent {
  topPercent: number;
  heightPercent: number;
}

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_START = 8 * 60;
const DEFAULT_END = 18 * 60;
const DEFAULT_SLOT_MINUTES = 30;
const MIN_SLOT_MINUTES = 5;

const gcd = (a: number, b: number): number => {
  let x = Math.abs(a);
  let y = Math.abs(b);

  if (x === 0) return y;
  if (y === 0) return x;

  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }

  return x;
};

export const timeToMinutes = (time: string): number => {
  const [hoursPart, minutesPart] = time.split(":");
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours >= 24 ||
    minutes < 0 ||
    minutes >= 60
  ) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

const computeSlotSize = (events: TimetableEvent[]): number => {
  if (!events.length) {
    return DEFAULT_SLOT_MINUTES;
  }

  const durations = events
    .map((event) => {
      const duration =
        timeToMinutes(event.endTime) - timeToMinutes(event.startTime);
      return duration > 0 ? duration : 0;
    })
    .filter((duration) => duration > 0);

  const boundaries = events
    .flatMap((event) => [
      timeToMinutes(event.startTime),
      timeToMinutes(event.endTime),
    ])
    .sort((a, b) => a - b);

  const offsets: number[] = [];
  for (let index = 1; index < boundaries.length; index += 1) {
    const diff = boundaries[index]! - boundaries[index - 1]!;
    if (diff > 0) {
      offsets.push(diff);
    }
  }

  const candidates = [...durations, ...offsets, DEFAULT_SLOT_MINUTES];
  const slot = candidates.reduce(
    (acc, current) => gcd(acc, current),
    candidates[0]!
  );

  return Math.max(MIN_SLOT_MINUTES, slot || DEFAULT_SLOT_MINUTES);
};

export const useTimetableGrid = (events: ComputedRef<TimetableEvent[]>) => {
  const slotSizeMinutes = computed(() => computeSlotSize(events.value));

  const timeRange = computed<TimetableRange>(() => {
    if (!events.value.length) {
      return {
        startMinutes: DEFAULT_START,
        endMinutes: DEFAULT_END,
        totalMinutes: DEFAULT_END - DEFAULT_START,
      };
    }

    const startCandidate = Math.min(
      ...events.value.map((event) => timeToMinutes(event.startTime))
    );
    const endCandidate = Math.max(
      ...events.value.map((event) => timeToMinutes(event.endTime))
    );

    const slot = slotSizeMinutes.value || DEFAULT_SLOT_MINUTES;
    const startMinutes = Math.floor(startCandidate / slot) * slot;
    const endMinutes = Math.ceil(endCandidate / slot) * slot;
    const normalizedEnd = Math.max(endMinutes, startMinutes + slot);

    return {
      startMinutes,
      endMinutes: normalizedEnd,
      totalMinutes: normalizedEnd - startMinutes,
    };
  });

  const timeSlots = computed(() => {
    const slots: number[] = [];
    const { startMinutes, endMinutes } = timeRange.value;
    const slotMinutes = slotSizeMinutes.value || DEFAULT_SLOT_MINUTES;

    for (
      let minutes = startMinutes;
      minutes < endMinutes;
      minutes += slotMinutes
    ) {
      slots.push(minutes);
    }

    return slots;
  });

  const eventsByDay = computed<Record<Day, PositionedTimetableEvent[]>>(() => {
    const base = days.reduce(
      (acc, day) => ({
        ...acc,
        [day]: [] as PositionedTimetableEvent[],
      }),
      {} as Record<Day, PositionedTimetableEvent[]>
    );

    const { startMinutes, totalMinutes } = timeRange.value;
    const safeTotalMinutes =
      totalMinutes || slotSizeMinutes.value || DEFAULT_SLOT_MINUTES;

    events.value.forEach((event) => {
      const eventStart = timeToMinutes(event.startTime);
      const eventEnd = timeToMinutes(event.endTime);
      const duration = Math.max(eventEnd - eventStart, MIN_SLOT_MINUTES);

      if (eventEnd <= eventStart) {
        return;
      }

      const topPercent = ((eventStart - startMinutes) / safeTotalMinutes) * 100;
      const heightPercent = (duration / safeTotalMinutes) * 100;

      base[event.day].push({
        ...event,
        topPercent: Math.min(100, Math.max(0, topPercent)),
        heightPercent: Math.min(
          100,
          Math.max(heightPercent, (MIN_SLOT_MINUTES / safeTotalMinutes) * 100)
        ),
      });
    });

    Object.values(base).forEach((list) =>
      list.sort(
        (eventA, eventB) =>
          timeToMinutes(eventA.startTime) - timeToMinutes(eventB.startTime)
      )
    );

    return base;
  });

  const eventColors = computed<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    const baseColors = [
      "bg-blue-500/20 border-blue-500",
      "bg-green-500/20 border-green-500",
      "bg-purple-500/20 border-purple-500",
      "bg-orange-500/20 border-orange-500",
      "bg-pink-500/20 border-pink-500",
      "bg-cyan-500/20 border-cyan-500",
      "bg-yellow-500/20 border-yellow-500",
    ];

    let colorIndex = 0;

    events.value.forEach((event) => {
      const courseCode = event.title.split("-")[0];
      if (courseCode && !colors[courseCode]) {
        colors[courseCode] = baseColors[colorIndex % baseColors.length]!;
        colorIndex += 1;
      }
    });

    return colors;
  });

  const getEventColor = (title: string) => {
    const courseCode = title.split("-")[0];
    return (
      eventColors.value[courseCode || ""] || "bg-gray-500/20 border-gray-500"
    );
  };

  return {
    days,
    timeSlots,
    timeRange,
    slotSizeMinutes,
    eventsByDay,
    eventColors,
    getEventColor,
    minutesToTime,
  };
};
