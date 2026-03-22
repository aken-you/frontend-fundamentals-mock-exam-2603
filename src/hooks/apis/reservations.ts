import { useQuery } from '@tanstack/react-query';
import { getReservations } from 'pages/remotes';

export const reservationsKeys = {
  all: ['reservations'] as const,
  filteredByDate: (date: string) => ['reservations', date] as const,
};

export const useGetReservations = (date: string) => {
  return useQuery(reservationsKeys.filteredByDate(date), () => getReservations(date), {
    enabled: !!date,
  });
};
