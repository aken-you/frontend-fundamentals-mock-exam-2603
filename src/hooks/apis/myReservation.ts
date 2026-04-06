import { useQuery, useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getMyReservations, cancelReservation, createReservation } from 'pages/remotes';
import { reservationKeys } from './reservation';

export const myReservationKeys = {
  all: () => ['myReservation'],

  lists: () =>
    queryOptions({
      queryKey: [...myReservationKeys.all(), 'list'],
      queryFn: getMyReservations,
    }),
};

export const useGetMyReservationList = () => {
  return useQuery(myReservationKeys.lists());
};

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
