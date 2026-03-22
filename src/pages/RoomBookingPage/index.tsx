import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Top, Spacing, Border, Button, Text, Select, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import axios from 'axios';
import { useGetRooms } from 'hooks/apis/rooms';
import { useGetReservations } from 'hooks/apis/reservations';
import { useCreateReservation } from 'hooks/apis/myReservations';
import { DatePicker } from 'components/DatePicker';
import { Chip } from 'components/Chip';
import { AvailableRoomList } from 'components/AvailableRoomList';

const EQUIPMENT_LABELS: Record<string, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

const ALL_EQUIPMENT = ['tv', 'whiteboard', 'video', 'speaker'];

const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function RoomBookingPage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [date, setDate] = useState(searchParams.get('date') || formatDate(new Date()));
  const [startTime, setStartTime] = useState(searchParams.get('startTime') || '');
  const [endTime, setEndTime] = useState(searchParams.get('endTime') || '');
  const [attendees, setAttendees] = useState(Number(searchParams.get('attendees')) || 1);
  const [equipment, setEquipment] = useState<string[]>(
    searchParams.get('equipment') ? searchParams.get('equipment')!.split(',').filter(Boolean) : []
  );
  const [preferredFloor, setPreferredFloor] = useState<number | null>(
    searchParams.get('floor') ? Number(searchParams.get('floor')) : null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // URL 쿼리 파라미터 동기화
  useEffect(() => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (attendees > 1) params.attendees = String(attendees);
    if (equipment.length > 0) params.equipment = equipment.join(',');
    if (preferredFloor !== null) params.floor = String(preferredFloor);
    setSearchParams(params, { replace: true });
  }, [date, startTime, endTime, attendees, equipment, preferredFloor, setSearchParams]);

  const { data: rooms = [] } = useGetRooms();
  const { data: reservations = [] } = useGetReservations(date);

  const createMutation = useCreateReservation();

  // 필터 변경 시 선택 초기화
  const handleFilterChange = () => {
    setSelectedRoomId(null);
    setErrorMessage(null);
  };

  // 입력 검증
  let validationError: string | null = null;
  const hasTimeInputs = startTime !== '' && endTime !== '';
  if (hasTimeInputs) {
    if (endTime <= startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  // 필터링
  const floors = [...new Set(rooms.map((r: { floor: number }) => r.floor))].sort((a: number, b: number) => a - b);

  const availableRooms = isFilterComplete
    ? rooms
        .filter((room: { id: string; capacity: number; equipment: string[]; floor: number }) => {
          if (room.capacity < attendees) return false;
          if (!equipment.every(eq => room.equipment.includes(eq))) return false;
          if (preferredFloor !== null && room.floor !== preferredFloor) return false;
          const hasConflict = reservations.some(
            (r: { roomId: string; date: string; start: string; end: string }) =>
              r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
          );
          if (hasConflict) return false;
          return true;
        })
        .sort((a: { floor: number; name: string }, b: { floor: number; name: string }) => {
          if (a.floor !== b.floor) return a.floor - b.floor;
          return a.name.localeCompare(b.name);
        })
    : [];

  const handleBook = async () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId: selectedRoomId,
        date,
        start: startTime,
        end: endTime,
        attendees,
        equipment,
      });

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      setErrorMessage(errResult.message ?? '예약에 실패했습니다.');
      setSelectedRoomId(null);
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      setErrorMessage(serverMessage);
      setSelectedRoomId(null);
    }
  };

  return (
    <div
      css={css`
        background: ${colors.white};
        padding-bottom: 40px;
      `}
    >
      <div
        css={css`
          padding: 12px 24px 0;
        `}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="뒤로가기"
          css={css`
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            font-size: 14px;
            color: ${colors.grey600};
            &:hover {
              color: ${colors.grey900};
            }
          `}
        >
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03
        css={css`
          padding-left: 24px;
          padding-right: 24px;
        `}
      >
        예약하기
      </Top.Top03>

      {errorMessage && (
        <div
          css={css`
            padding: 0 24px;
          `}
        >
          <Spacing size={12} />
          <div
            css={css`
              padding: 10px 14px;
              border-radius: 10px;
              background: ${colors.red50};
              display: flex;
              align-items: center;
              gap: 8px;
            `}
          >
            <Text typography="t7" fontWeight="medium" color={colors.red500}>
              {errorMessage}
            </Text>
          </div>
        </div>
      )}

      <Spacing size={24} />

      {/* 예약 조건 입력 */}
      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />

        {/* 날짜 */}
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 6px;
          `}
        >
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            날짜
          </Text>
          <DatePicker
            value={date}
            min={formatDate(new Date())}
            onChange={value => {
              setDate(value);
              handleFilterChange();
            }}
          />
        </div>
        <Spacing size={14} />

        {/* 시간 */}
        <div
          css={css`
            display: flex;
            gap: 12px;
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              시작 시간
            </Text>
            <Select
              value={startTime}
              onChange={e => {
                setStartTime(e.target.value);
                handleFilterChange();
              }}
              aria-label="시작 시간"
            >
              <option value="">선택</option>
              {TIME_SLOTS.slice(0, -1).map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              종료 시간
            </Text>
            <Select
              value={endTime}
              onChange={e => {
                setEndTime(e.target.value);
                handleFilterChange();
              }}
              aria-label="종료 시간"
            >
              <option value="">선택</option>
              {TIME_SLOTS.slice(1).map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Spacing size={14} />

        {/* 참석 인원 + 선호 층 */}
        <div
          css={css`
            display: flex;
            gap: 12px;
          `}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              참석 인원
            </Text>
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={e => {
                setAttendees(Math.max(1, Number(e.target.value)));
                handleFilterChange();
              }}
              aria-label="참석 인원"
              css={css`
                box-sizing: border-box;
                font-size: 16px;
                font-weight: 500;
                line-height: 1.5;
                height: 48px;
                background-color: ${colors.grey50};
                border-radius: 12px;
                color: ${colors.grey800};
                width: 100%;
                border: 1px solid ${colors.grey200};
                padding: 0 16px;
                outline: none;
                transition: border-color 0.15s;
                &:focus {
                  border-color: ${colors.blue500};
                }
              `}
            />
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 6px;
              flex: 1;
            `}
          >
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              선호 층
            </Text>
            <Select
              value={preferredFloor ?? ''}
              onChange={e => {
                const val = e.target.value;
                setPreferredFloor(val === '' ? null : Number(val));
                handleFilterChange();
              }}
              aria-label="선호 층"
            >
              <option value="">전체</option>
              {floors.map((f: number) => (
                <option key={f} value={f}>
                  {f}층
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Spacing size={14} />

        {/* 장비 */}
        <div>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            필요 장비
          </Text>
          <Spacing size={8} />
          <div
            css={css`
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            `}
          >
            {ALL_EQUIPMENT.map(eq => {
              const selected = equipment.includes(eq);
              return (
                <Chip
                  key={eq}
                  label={EQUIPMENT_LABELS[eq]}
                  selected={selected}
                  onClick={() => {
                    const next = selected ? equipment.filter(e => e !== eq) : [...equipment, eq];
                    setEquipment(next);
                    handleFilterChange();
                  }}
                  ariaLabel={EQUIPMENT_LABELS[eq]}
                />
              );
            })}
          </div>
        </div>
      </div>

      {validationError && (
        <div
          css={css`
            padding: 0 24px;
          `}
        >
          <Spacing size={8} />
          <span
            css={css`
              color: ${colors.red500};
              font-size: 14px;
            `}
            role="alert"
          >
            {validationError}
          </span>
        </div>
      )}

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 가능 회의실 목록 */}
      {isFilterComplete && (
        <AvailableRoomList
          availableRooms={availableRooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          onBook={handleBook}
          isBooking={createMutation.isLoading}
        />
      )}

      <Spacing size={24} />
    </div>
  );
}
