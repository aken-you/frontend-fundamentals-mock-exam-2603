import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { DatePicker } from 'components/common/DatePicker';
import { Timeline } from 'components/Timeline';
import { MyReservationList } from 'components/MyReservationList';
import { useGetRoomList } from 'hooks/apis/room';
import { useGetReservationList } from 'hooks/apis/reservation';
import { useMessage } from 'hooks/useMessage';
import { formatDate } from 'utils/format';

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
  const { data: roomList = [] } = useGetRoomList();
  const { data: reservationList = [] } = useGetReservationList(date);

  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  return (
    <section
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
      <section
        css={css`
          padding: 0 24px;
        `}
      >
        <Text as="label" htmlFor="date" typography="t5" fontWeight="bold" color={colors.grey900}>
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
          <DatePicker id="date" name="date" value={date} onChange={setDate} min={formatDate(new Date())} />
        </div>
      </section>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 현황 타임라인 */}
      <section
        css={css`
          padding: 0 24px;
        `}
      >
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 현황
        </Text>
        <Spacing size={16} />
        <Timeline
          rooms={roomList}
          reservations={reservationList}
          activeReservation={activeReservation}
          onActiveReservationChange={setActiveReservation}
        />
      </section>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 메시지 배너 */}
      {message && (
        <section
          css={css`
            padding: 0 24px;
          `}
        >
          <MessageBanner type={message.type}>{message.text}</MessageBanner>
          <Spacing size={12} />
        </section>
      )}

      {/* 내 예약 목록 */}
      <MyReservationList onMessage={setMessage} />

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
    </section>
  );
}
