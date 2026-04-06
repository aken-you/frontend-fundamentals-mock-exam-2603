import { queryOptions, useQuery } from '@tanstack/react-query';
import { getRooms } from 'apis/remotes';

const roomKeys = {
  all: () => ['room'],
  lists: () =>
    queryOptions({
      queryKey: [...roomKeys.all(), 'list'],
      queryFn: getRooms,
    }),
};

export const useGetRoomList = () => {
  return useQuery(roomKeys.lists());
};
