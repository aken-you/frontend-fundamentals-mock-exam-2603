import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation } from 'pages/remotes';
import { reservationsKeys } from './reservations';

export const myReservationsKeys = {
  all: ['myReservations'] as const,
};

export const useGetMyReservations = () => {
  return useQuery(myReservationsKeys.all, getMyReservations);
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationsKeys.all });
      queryClient.invalidateQueries({ queryKey: myReservationsKeys.all });
    },
  });
};
