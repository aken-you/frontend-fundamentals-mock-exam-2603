import { Equipment, Reservation, Room } from '_tosslib/server/types';
import { ALL_EQUIPMENT } from 'constants/room';
import { Filters } from 'hooks/useBookingFilters';

export function isEquipment(value: string): value is Equipment {
  return ALL_EQUIPMENT.includes(value as Equipment);
}

export function filterAvailableRooms({
  filters: { date, startTime, endTime, attendees, equipment, preferredFloor },
  rooms,
  reservations,
}: {
  filters: Filters;
  rooms: Room[];
  reservations: Reservation[];
}) {
  return rooms
    .filter((room: { id: string; capacity: number; equipment: string[]; floor: number }) => {
      if (room.capacity < attendees) return false;
      if (!equipment.every(eq => room.equipment.includes(eq))) return false;
      if (preferredFloor !== null && room.floor !== preferredFloor) return false;
      const hasConflict = reservations.some(
        (r: { roomId: string; date: string; start: string; end: string }) =>
          r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
      );
      if (hasConflict) return false;
      return true;
    })
    .sort((a: { floor: number; name: string }, b: { floor: number; name: string }) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });
}
