import { css } from '@emotion/react';
import { colors } from '_tosslib/constants/colors';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

export function Chip({ label, selected, onClick, ariaLabel }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      aria-pressed={selected}
      css={css`
        padding: 8px 16px;
        border-radius: 20px;
        border: 1px solid ${selected ? colors.blue500 : colors.grey200};
        background: ${selected ? colors.blue50 : colors.grey50};
        color: ${selected ? colors.blue600 : colors.grey700};
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        &:hover {
          border-color: ${selected ? colors.blue500 : colors.grey400};
        }
      `}
    >
      {label}
    </button>
  );
}
