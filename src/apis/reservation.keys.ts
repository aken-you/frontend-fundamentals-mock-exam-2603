import { queryOptions } from '@tanstack/react-query';
import { getReservations } from './remotes';

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
