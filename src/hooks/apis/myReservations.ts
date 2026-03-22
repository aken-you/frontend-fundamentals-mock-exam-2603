import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation, createReservation } from 'pages/remotes';
import { reservationsKeys } from './reservations';

export const myReservationsKeys = {
  all: ['myReservations'] as const,
};

export const useGetMyReservations = () => {
  return useQuery(myReservationsKeys.all, getMyReservations);
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] }) =>
      createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: reservationsKeys.filteredByDate(variables.date),
        });
        queryClient.invalidateQueries({ queryKey: myReservationsKeys.all });
      },
    }
  );
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
