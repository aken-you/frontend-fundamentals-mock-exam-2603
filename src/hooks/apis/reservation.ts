import { queryOptions, useQuery } from '@tanstack/react-query';
import { getReservations } from 'pages/remotes';

export const reservationKeys = {
  all: () => ['reservation'],
  lists: () => [...reservationKeys.all(), 'list'],

  list: (date: string) =>
    queryOptions({
      queryKey: [...reservationKeys.lists(), date],
      queryFn: () => getReservations(date),
      enabled: !!date,
    }),
};

export const useGetReservationList = (date: string) => {
  return useQuery(reservationKeys.list(date));
};
