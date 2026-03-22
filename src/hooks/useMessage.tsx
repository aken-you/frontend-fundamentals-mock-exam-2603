import { css } from '@emotion/react';
import { useState, ReactNode } from 'react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';

export type MessageState = {
  type: 'success' | 'error';
  text: string;
};

type UseMessageProps = {
  initMessage?: MessageState | null;
};

type MessageBannerProps = {
  type: 'success' | 'error';
  children: ReactNode;
};

export function useMessage({ initMessage }: UseMessageProps = {}) {
  const [message, setMessage] = useState<MessageState | null>(initMessage ?? null);

  const MessageBanner = ({ type, children }: MessageBannerProps) => (
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

  return { message, setMessage, MessageBanner };
}
