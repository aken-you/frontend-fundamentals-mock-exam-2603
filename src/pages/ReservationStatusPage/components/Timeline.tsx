import { css } from '@emotion/react';
import { useState } from 'react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { Reservation } from '_tosslib/server/types';
import { EQUIPMENT_LABELS, HOUR_LABELS, TIMELINE_START, TOTAL_MINUTES } from 'constants/room';
import { Tooltip } from 'components/common/Tooltip';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - TIMELINE_START) * 60 + m;
}

interface TimelineProps {
  rowList: { id: string; name: string }[];
  eventList: Reservation[];
}

export function Timeline({ rowList, eventList }: TimelineProps) {
  const [activeTime, setActiveTime] = useState<string | null>(null);

  return (
    <div
      css={css`
        background: ${colors.grey50};
        border-radius: 14px;
        padding: 16px;
      `}
    >
      {/* 시간 헤더 */}
      <div
        css={css`
          display: flex;
          align-items: flex-end;
          margin-bottom: 8px;
        `}
      >
        <div
          css={css`
            width: 80px;
            flex-shrink: 0;
            padding-right: 8px;
          `}
        />
        <div
          css={css`
            flex: 1;
            position: relative;
            height: 18px;
          `}
        >
          {HOUR_LABELS.map(t => {
            const left = (timeToMinutes(t) / TOTAL_MINUTES) * 100;
            return (
              <Text
                key={t}
                typography="t7"
                fontWeight="regular"
                color={colors.grey400}
                css={css`
                  position: absolute;
                  left: ${left}%;
                  transform: translateX(-50%);
                  font-size: 10px;
                  letter-spacing: -0.3px;
                `}
              >
                {t.slice(0, 2)}
              </Text>
            );
          })}
        </div>
      </div>

      {rowList.map((row, index) => {
        const targetEventList = eventList.filter(event => event.roomId === row.id);

        return (
          <div
            key={row.id}
            css={css`
              display: flex;
              align-items: center;
              height: 32px;
              ${index > 0 ? 'margin-top: 4px;' : ''}
            `}
          >
            <div
              css={css`
                width: 80px;
                flex-shrink: 0;
                padding-right: 8px;
              `}
            >
              <Text
                typography="t7"
                fontWeight="medium"
                color={colors.grey700}
                ellipsisAfterLines={1}
                css={css`
                  font-size: 12px;
                `}
              >
                {row.name}
              </Text>
            </div>
            <div
              css={css`
                flex: 1;
                height: 24px;
                background: ${colors.white};
                border-radius: 6px;
                position: relative;
                overflow: visible;
              `}
            >
              {targetEventList.map(res => {
                const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
                const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
                const isActive = activeTime === res.id;

                return (
                  <div
                    key={res.id}
                    css={css`
                      position: absolute;
                      left: ${left}%;
                      width: ${width}%;
                      height: 100%;
                    `}
                  >
                    <div
                      role="button"
                      aria-label={`${row.name} ${res.start}-${res.end} 예약 상세`}
                      onClick={() => {
                        const newActiveId = isActive ? null : res.id;
                        setActiveTime(newActiveId);
                      }}
                      css={css`
                        width: 100%;
                        height: 100%;
                        background: ${colors.blue400};
                        border-radius: 4px;
                        opacity: ${isActive ? 1 : 0.75};
                        cursor: pointer;
                        transition: opacity 0.15s;
                        &:hover {
                          opacity: 1;
                        }
                      `}
                    />
                    {isActive && (
                      <Tooltip>
                        <div>
                          {res.start} ~ {res.end}
                        </div>
                        <div>{res.attendees}명</div>
                        {res.equipment.length > 0 && (
                          <div>{res.equipment.map(e => EQUIPMENT_LABELS[e]).join(', ')}</div>
                        )}
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
