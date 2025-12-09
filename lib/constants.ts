import { User } from "./types";

export const USERS: User[] = [
  { id: 1, firstName: "Ella", email: "ella@vc.com", password: "ella123" },
  { id: 2, firstName: "Paul", email: "paul@vc.com", password: "paul123" },
  { id: 3, firstName: "Larina", email: "larina@vc.com", password: "larina123" }
];

export const CURRENT_USER_ID = 1; // Default: Ella (Boss)

export const STORAGE_KEYS = {
  TIME_ENTRIES: "vc_time_entries",
  LEAVE_REQUESTS: "vc_leave_requests",
  SALARY_PAYMENTS: "vc_salary_payments",
  NOTIFICATIONS: "vc_notifications",
  THEME: "vc_theme",
  CURRENT_USER: "vc_current_user",
  USER_PROFILES: "vc_user_profiles"
};

export const MONTHLY_SALARY = 32444; // ₱32,444
export const PTO_ANNUAL_DAYS = 15;
export const PTO_RESET_DATE = "08-25"; // August 25 - work anniversary
export const LATE_THRESHOLD_HOUR = 9; // 9:00 AM