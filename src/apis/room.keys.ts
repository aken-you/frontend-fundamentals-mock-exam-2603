import { queryOptions } from '@tanstack/react-query';
import { getRooms } from './remotes';

export const roomKeys = {
  all: () => ['room'],
  lists: () =>
    queryOptions({
      queryKey: [...roomKeys.all(), 'list'],
      queryFn: getRooms,
    }),
};
