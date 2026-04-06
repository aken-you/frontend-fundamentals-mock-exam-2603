import { useState } from 'react';

export type MessageState = {
  type: 'success' | 'error';
  text: string;
};

type UseMessageProps = {
  initMessage?: MessageState | null;
};

export function useMessage({ initMessage }: UseMessageProps = {}) {
  const [message, setMessage] = useState<MessageState | null>(initMessage ?? null);

  return [message, setMessage] as const;
}
