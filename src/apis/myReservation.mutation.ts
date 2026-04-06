import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { cancelReservation, createReservation } from 'apis/remotes';
import { myReservationKeys } from './myReservation.keys';
import { reservationKeys } from './reservation.keys';

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      roomId: string;
      date: string;
      start: string;
      end: string;
      attendees: number;
      equipment: string[];
    }) => createReservation(data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(reservationKeys.list(variables.date));
      queryClient.invalidateQueries({ queryKey: myReservationKeys.all() });
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all() });
      queryClient.invalidateQueries({ queryKey: myReservationKeys.all() });
    },
  });
};
