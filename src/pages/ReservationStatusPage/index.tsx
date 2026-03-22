import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { DatePicker } from 'components/DatePicker';
import { Timeline } from 'components/Timeline';
import { MyReservations } from 'components/MyReservations';
import { useGetRooms } from 'hooks/apis/rooms';
import { useGetReservations } from 'hooks/apis/reservations';
import { useGetMyReservations, useCancelReservation } from 'hooks/apis/myReservations';
import { useMessage } from 'hooks/useMessage';

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

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { message?: string } | null;

  const initMessage = locationState?.message ? { type: 'success' as const, text: locationState.message } : null;
  const { message, setMessage, MessageBanner } = useMessage({ initMessage });

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const [date, setDate] = useState(formatDate(new Date()));
  const { data: rooms = [] } = useGetRooms();
  const { data: reservations = [] } = useGetReservations(date);
  const { data: myReservationList = [] } = useGetMyReservations();

  const cancelMutation = useCancelReservation();

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      setMessage({ type: 'success', text: '예약이 취소되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '취소에 실패했습니다.' });
    }
  };

  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  const getRoomName = (roomId: string) =>
    rooms.find((r: { id: string; name: string }) => r.id === roomId)?.name ?? roomId;

  return (
    <div
      css={css`
        background: ${colors.white};
        padding-bottom: 40px;
      `}
    >
      <Top.Top03
        css={css`
          padding-left: 24px;
          padding-right: 24px;
        `}
      >
        회의실 예약
      </Top.Top03>

      <Spacing size={24} />

      {/* 날짜 선택 */}
      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 6px;
          `}
        >
          <DatePicker value={date} onChange={setDate} min={formatDate(new Date())} />
        </div>
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 현황 타임라인 */}
      <Timeline
        rooms={rooms}
        reservations={reservations}
        activeReservation={activeReservation}
        onActiveReservationChange={setActiveReservation}
      />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 메시지 배너 */}
      {message && (
        <div
          css={css`
            padding: 0 24px;
          `}
        >
          <MessageBanner type={message.type}>{message.text}</MessageBanner>
          <Spacing size={12} />
        </div>
      )}

      {/* 내 예약 목록 */}
      <MyReservations reservations={myReservationList} getRoomName={getRoomName} onCancel={handleCancel} />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약하기 버튼 */}
      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}
