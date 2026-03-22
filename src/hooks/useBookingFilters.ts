import { Equipment } from '_tosslib/server/types';
import { MIN_ATTENDEES } from 'constants/room';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatDate } from 'utils/format';
import { isEquipment } from 'utils/room';

export interface Filters {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
}

export function useBookingFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    date: searchParams.get('date') || formatDate(new Date()),
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
    attendees: Number(searchParams.get('attendees')) || MIN_ATTENDEES,
    equipment: searchParams.get('equipment') ? searchParams.get('equipment')!.split(',').filter(isEquipment) : [],
    preferredFloor: searchParams.get('floor') ? Number(searchParams.get('floor')) : null,
  });

  // URL 쿼리 파라미터 동기화
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.date) params.date = filters.date;
    if (filters.startTime) params.startTime = filters.startTime;
    if (filters.endTime) params.endTime = filters.endTime;
    if (filters.attendees >= MIN_ATTENDEES) params.attendees = String(filters.attendees);
    if (filters.equipment.length > 0) params.equipment = filters.equipment.join(',');
    if (filters.preferredFloor !== null) params.floor = String(filters.preferredFloor);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // 입력 검증
  let validationError: string | null = null;
  const hasTimeInputs = filters.startTime !== '' && filters.endTime !== '';
  if (hasTimeInputs) {
    if (filters.endTime <= filters.startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (filters.attendees < MIN_ATTENDEES) {
      validationError = `참석 인원은 ${MIN_ATTENDEES}명 이상이어야 합니다.`;
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  return { filters, setFilters, validationError, isFilterComplete };
}
