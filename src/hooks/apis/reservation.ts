import { useQuery } from '@tanstack/react-query';
import { getReservations } from 'pages/remotes';

export const reservationKeys = {
  all: ['reservationList'] as const,
  filteredByDate: (date: string) => ['reservationList', date] as const,
};

export const useGetReservationList = (date: string) => {
  return useQuery(reservationKeys.filteredByDate(date), () => getReservations(date), {
    enabled: !!date,
  });
};
