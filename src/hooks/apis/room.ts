import { useQuery } from '@tanstack/react-query';
import { getRooms } from 'pages/remotes';

const roomKeys = {
  all: ['roomList'] as const,
};

export const useGetRoomList = () => {
  return useQuery(roomKeys.all, getRooms);
};
