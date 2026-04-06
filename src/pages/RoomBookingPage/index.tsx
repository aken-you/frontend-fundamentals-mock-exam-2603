import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Spacing, Border, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import axios from 'axios';
import { useGetRoomList } from 'apis/room';
import { useGetReservationList } from 'apis/reservation';
import { useCreateReservation } from 'apis/myReservation';
import { BookingFilters } from './components/BookingFilters';
import { AvailableRoomList } from './components/AvailableRoomList';
import { useBookingFilters } from './hooks/useBookingFilters';
import { filterAvailableRoom } from 'utils/room';
import { useMessage } from 'hooks/useMessage';
import { Message } from 'components/Message';

export function RoomBookingPage() {
  const navigate = useNavigate();

  const { filters, setFilters, validationError, isFilterComplete } = useBookingFilters();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const [message, setMessage] = useMessage();

  const { data: roomList = [] } = useGetRoomList();
  const { data: reservationList = [] } = useGetReservationList(filters.date);

  const createMutation = useCreateReservation();

  // 필터링
  const floors = [...new Set(roomList.map((r: { floor: number }) => r.floor))].sort((a: number, b: number) => a - b);

  const availableRoomList = isFilterComplete
    ? filterAvailableRoom({
        filters,
        roomList,
        reservationList,
      })
    : [];

  const handleBook = async () => {
    if (!selectedRoomId) {
      setMessage({
        type: 'error',
        text: '회의실을 선택해주세요.',
      });

      return;
    }
    if (!filters.startTime || !filters.endTime) {
      setMessage({
        type: 'error',
        text: '시작 시간과 종료 시간을 선택해주세요.',
      });

      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId: selectedRoomId,
        date: filters.date,
        start: filters.startTime,
        end: filters.endTime,
        attendees: filters.attendees,
        equipment: filters.equipment,
      });

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      setMessage({
        type: 'error',
        text: errResult.message ?? '예약에 실패했습니다.',
      });

      setSelectedRoomId(null);
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }

      setMessage({
        type: 'error',
        text: serverMessage,
      });

      setSelectedRoomId(null);
    }
  };

  return (
    <section
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

      {message?.type === 'error' && message?.text !== '' && (
        <div
          css={css`
            padding: 0 24px;
          `}
        >
          <Spacing size={12} />
          <Message type="error">{message.text}</Message>
        </div>
      )}

      <Spacing size={24} />

      {/* 예약 조건 입력 */}
      <BookingFilters
        value={filters}
        onChange={nextFilters => {
          setFilters(nextFilters);
          setSelectedRoomId(null);
          setMessage({
            type: 'success',
            text: '',
          });
        }}
        floors={floors}
      />

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
          availableRooms={availableRoomList}
          selectedRoomId={selectedRoomId}
          onSelect={setSelectedRoomId}
          onBook={handleBook}
          isBooking={createMutation.isPending}
        />
      )}

      <Spacing size={24} />
    </section>
  );
}
