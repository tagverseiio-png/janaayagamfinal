export const TICKET_STATUS = [
  'SUBMITTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'ESCALATED',
  'RESOLVED',
  'REOPENED',
  'CLOSED'
] as const;

export type TicketStatus = typeof TICKET_STATUS[number];

export const PRIORITY = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
] as const;

export type Priority = typeof PRIORITY[number];

export const CHANNEL = [
  'APP',
  'WEB',
  'HELPLINE',
  'EMAIL',
  'WALK_IN'
] as const;

export type Channel = typeof CHANNEL[number];

export const ROLE_TYPE = [
  'CITIZEN',
  'VAO',
  'PANCHAYAT_PRESIDENT',
  'BDO',
  'TAHSILDAR',
  'ZONAL_OFFICER',
  'COMMISSIONER',
  'RDO',
  'COLLECTOR',
  'MLA',
  'MINISTER',
  'CM',
  'SUPER_ADMIN'
] as const;

export type RoleType = typeof ROLE_TYPE[number];

export const BODY_TRACK = [
  'URBAN',
  'RURAL',
  'REVENUE'
] as const;

export type BodyTrack = typeof BODY_TRACK[number];

export const SLA_UNIT = [
  'HOURS',
  'DAYS',
  'WORKING_DAYS'
] as const;

export type SlaUnit = typeof SLA_UNIT[number];
