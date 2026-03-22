import { useQuery } from '@tanstack/react-query';
import { getRooms } from 'pages/remotes';

const roomsKeys = {
  all: ['rooms'] as const,
};

export const useGetRooms = () => {
  return useQuery(roomsKeys.all, getRooms);
};
