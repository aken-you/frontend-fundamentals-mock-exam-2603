import { css } from '@emotion/react';
import { Text, Spacing, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { DatePicker } from 'components/common/DatePicker';
import { Chip } from 'components/common/Chip';
import { formatDate } from 'utils/format';
import { ALL_EQUIPMENT, EQUIPMENT_LABELS, TIME_SLOTS } from 'constants/room';
import { Filters } from 'hooks/useBookingFilters';

interface BookingFiltersProps {
  value: Filters;
  onChange: (nextValue: Filters) => void;
  floors: number[];
}

export function BookingFilters({ value, onChange, floors }: BookingFiltersProps) {
  return (
    <section
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
        <Text as="label" htmlFor="date" typography="t7" fontWeight="medium" color={colors.grey600}>
          날짜
        </Text>
        <DatePicker
          id="date"
          name="date"
          value={value.date}
          min={formatDate(new Date())}
          onChange={nextValue => {
            onChange({ ...value, date: nextValue });
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
          <Text as="label" htmlFor="start-time" typography="t7" fontWeight="medium" color={colors.grey600}>
            시작 시간
          </Text>
          <Select
            id="start-time"
            name="start-time"
            value={value.startTime}
            onChange={e => {
              onChange({ ...value, startTime: e.target.value });
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
          <Text as="label" htmlFor="end-time" typography="t7" fontWeight="medium" color={colors.grey600}>
            종료 시간
          </Text>
          <Select
            id="end-time"
            name="end-time"
            value={value.endTime}
            onChange={e => {
              onChange({ ...value, endTime: e.target.value });
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
          <Text as="label" htmlFor="attendees" typography="t7" fontWeight="medium" color={colors.grey600}>
            참석 인원
          </Text>
          <input
            type="number"
            min={1}
            id="attendees"
            name="attendees"
            value={value.attendees}
            onChange={e => {
              onChange({ ...value, attendees: Math.max(1, Number(e.target.value)) });
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
          <Text as="label" htmlFor="floor" typography="t7" fontWeight="medium" color={colors.grey600}>
            선호 층
          </Text>
          <Select
            id="floor"
            name="floor"
            value={value.preferredFloor ?? ''}
            onChange={e => {
              const val = e.target.value;
              onChange({ ...value, preferredFloor: val === '' ? null : Number(val) });
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
            const selected = value.equipment.includes(eq);
            return (
              <Chip
                key={eq}
                label={EQUIPMENT_LABELS[eq]}
                selected={selected}
                onClick={() => {
                  const next = selected ? value.equipment.filter(e => e !== eq) : [...value.equipment, eq];
                  onChange({ ...value, equipment: next });
                }}
                ariaLabel={EQUIPMENT_LABELS[eq]}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
