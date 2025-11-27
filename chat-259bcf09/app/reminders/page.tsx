/**
 * Reminder System Demo Page
 * Complete demonstration of the VC Time Tracker reminder system
 */

import { ReminderDemo } from '@/src/components/reminders/reminder-demo'
import { ReminderIntegration } from '@/src/components/reminders/reminder-integration'

export default function RemindersPage() {
  return (
    <ReminderIntegration>
      <ReminderDemo />
    </ReminderIntegration>
  )
}