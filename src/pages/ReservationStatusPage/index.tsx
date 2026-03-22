import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getReservations, getMyReservations, cancelReservation } from 'pages/remotes';
import { DatePicker } from 'components/DatePicker';
import { Timeline } from 'components/Timeline';

const EQUIPMENT_LABELS: Record<string, string> = {
  tv: 'TV',
  whiteboard: '화이트보드',
  video: '화상장비',
  speaker: '스피커',
};

const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 20) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
  }
}

const HOUR_LABELS = TIME_SLOTS.filter(t => t.endsWith(':00'));
const TIMELINE_START = 9;
const TIMELINE_END = 20;
const TOTAL_MINUTES = (TIMELINE_END - TIMELINE_START) * 60;

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - TIMELINE_START) * 60 + m;
}

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(formatDate(new Date()));

  const locationState = location.state as { message?: string } | null;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    locationState?.message ? { type: 'success', text: locationState.message } : null
  );

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery(['reservations', date], () => getReservations(date), {
    enabled: !!date,
  });
  const { data: myReservationList = [] } = useQuery(['myReservations'], getMyReservations);

  const cancelMutation = useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });

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
          <div
            css={css`
              padding: 10px 14px;
              border-radius: 10px;
              background: ${message.type === 'success' ? colors.blue50 : colors.red50};
              display: flex;
              align-items: center;
              gap: 8px;
            `}
          >
            <Text
              typography="t7"
              fontWeight="medium"
              color={message.type === 'success' ? colors.blue600 : colors.red500}
            >
              {message.text}
            </Text>
          </div>
          <Spacing size={12} />
        </div>
      )}

      {/* 내 예약 목록 */}
      <div
        css={css`
          padding: 0 24px;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: baseline;
            gap: 6px;
          `}
        >
          <Text typography="t5" fontWeight="bold" color={colors.grey900}>
            내 예약
          </Text>
          {myReservationList.length > 0 && (
            <Text typography="t7" fontWeight="medium" color={colors.grey500}>
              {myReservationList.length}건
            </Text>
          )}
        </div>
        <Spacing size={16} />

        {myReservationList.length === 0 ? (
          <div
            css={css`
              padding: 40px 0;
              text-align: center;
              background: ${colors.grey50};
              border-radius: 14px;
            `}
          >
            <Text typography="t6" color={colors.grey500}>
              예약 내역이 없습니다.
            </Text>
          </div>
        ) : (
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 10px;
            `}
          >
            {myReservationList.map(
              (res: {
                id: string;
                roomId: string;
                date: string;
                start: string;
                end: string;
                attendees: number;
                equipment: string[];
              }) => (
                <div
                  key={res.id}
                  css={css`
                    padding: 14px 16px;
                    border-radius: 14px;
                    background: ${colors.grey50};
                    border: 1px solid ${colors.grey200};
                  `}
                >
                  <ListRow
                    contents={
                      <ListRow.Text2Rows
                        top={getRoomName(res.roomId)}
                        topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                        bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${
                          res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'
                        }`}
                        bottomProps={{ typography: 't7', color: colors.grey600 }}
                      />
                    }
                    right={
                      <Button
                        type="danger"
                        style="weak"
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm('정말 취소하시겠습니까?')) {
                            handleCancel(res.id);
                          }
                        }}
                      >
                        취소
                      </Button>
                    }
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>

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
