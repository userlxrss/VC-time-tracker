export const USERS = [
  {
    id: 1,
    firstName: "Maria",
    lastName: "Johnson",
    role: "boss",
    email: "maria.johnson@company.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    department: "Management",
    startDate: "2020-01-15"
  },
  {
    id: 2,
    firstName: "Carlos",
    lastName: "Rodriguez",
    role: "boss",
    email: "carlos.rodriguez@company.com",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    department: "Engineering",
    startDate: "2019-06-01"
  },
  {
    id: 3,
    firstName: "Larina",
    lastName: "Smith",
    role: "employee",
    email: "larina.smith@company.com",
    phone: "+1 (555) 345-6789",
    location: "San Francisco, CA",
    department: "Engineering",
    startDate: "2022-03-15"
  }
] as const

export const CURRENT_USER_ID = 3

export type UserRole = 'boss' | 'employee'

export type User = {
  id: number
  firstName: string
  lastName: string
  role: UserRole
  email: string
  phone: string
  location: string
  department: string
  startDate: string
}