import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation, createReservation } from 'pages/remotes';
import { reservationKeys } from './reservation';

export const myReservationKeys = {
  all: ['myReservationList'] as const,
};

export const useGetMyReservationList = () => {
  return useQuery(myReservationKeys.all, getMyReservations);
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] }) =>
      createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: reservationKeys.filteredByDate(variables.date),
        });
        queryClient.invalidateQueries({ queryKey: myReservationKeys.all });
      },
    }
  );
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
      queryClient.invalidateQueries({ queryKey: myReservationKeys.all });
    },
  });
};
