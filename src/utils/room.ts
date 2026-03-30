import { Equipment, Reservation, Room } from '_tosslib/server/types';
import { ALL_EQUIPMENT } from 'constants/room';
import { Filters } from 'hooks/useBookingFilters';

export function isEquipment(value: string): value is Equipment {
  return ALL_EQUIPMENT.includes(value as Equipment);
}

export function filterAvailableRoom({
  filters: { date, startTime, endTime, attendees, equipment, preferredFloor },
  roomList,
  reservationList,
}: {
  filters: Filters;
  roomList: Room[];
  reservationList: Reservation[];
}) {
  return roomList
    .filter((room: { id: string; capacity: number; equipment: string[]; floor: number }) => {
      const isEnoughCapacity = room.capacity >= attendees;
      if (!isEnoughCapacity) return false;

      const hasRequiredEquipment = equipment.every(eq => room.equipment.includes(eq));
      if (!hasRequiredEquipment) return false;

      if (preferredFloor !== null && room.floor !== preferredFloor) return false;

      const hasConflict = reservationList.some((r: { roomId: string; date: string; start: string; end: string }) => {
        const isSame = r.roomId === room.id && r.date === date;
        const isTimeConflict = r.start < endTime && r.end > startTime;

        return isSame && isTimeConflict;
      });
      if (hasConflict) return false;

      return true;
    })
    .sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });
}
