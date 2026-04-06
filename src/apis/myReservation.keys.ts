import { queryOptions } from '@tanstack/react-query';
import { getMyReservations } from './remotes';

export const myReservationKeys = {
  all: () => ['myReservation'],

  lists: () =>
    queryOptions({
      queryKey: [...myReservationKeys.all(), 'list'],
      queryFn: getMyReservations,
    }),
};
