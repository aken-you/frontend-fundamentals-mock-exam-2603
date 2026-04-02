import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';

interface MessageProps {
  type: 'success' | 'error';
  children: React.ReactNode;
}

export function Message({ type, children }: MessageProps) {
  return (
    <div
      css={css`
        padding: 10px 14px;
        border-radius: 10px;
        background: ${type === 'success' ? colors.blue50 : colors.red50};
        display: flex;
        align-items: center;
        gap: 8px;
      `}
    >
      <Text typography="t7" fontWeight="medium" color={type === 'success' ? colors.blue600 : colors.red500}>
        {children}
      </Text>
    </div>
  );
}
