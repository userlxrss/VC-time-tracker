export type User = {
  id: number;
  firstName: string;
  role: "boss" | "employee";
  isClockedIn?: boolean;
  todayHours?: number;
  weekHours?: number;
  monthHours?: number;
};

export const USERS: User[] = [
  {
    id: 1,
    firstName: "Maria",
    role: "boss",
    isClockedIn: true,
    todayHours: 6.5,
    weekHours: 32.5,
    monthHours: 140
  },
  {
    id: 2,
    firstName: "Carlos",
    role: "boss",
    isClockedIn: true,
    todayHours: 8.0,
    weekHours: 40.0,
    monthHours: 160
  },
  {
    id: 3,
    firstName: "Larina",
    role: "employee",
    isClockedIn: false,
    todayHours: 7.25,
    weekHours: 28.5,
    monthHours: 120
  },
  {
    id: 4,
    firstName: "Sarah",
    role: "employee",
    isClockedIn: true,
    todayHours: 4.0,
    weekHours: 24.0,
    monthHours: 96
  },
  {
    id: 5,
    firstName: "David",
    role: "employee",
    isClockedIn: false,
    todayHours: 8.5,
    weekHours: 38.5,
    monthHours: 154
  },
  {
    id: 6,
    firstName: "Emily",
    role: "employee",
    isClockedIn: true,
    todayHours: 5.75,
    weekHours: 31.25,
    monthHours: 125
  }
] as const;

export const CURRENT_USER_ID = 3;