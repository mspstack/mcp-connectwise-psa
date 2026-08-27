/** ConnectWise Manage REST resource shapes (fields this server selects). */

export interface Ref {
  id?: number;
  name?: string;
  identifier?: string;
}

export interface Ticket extends Record<string, unknown> {
  id: number;
  summary?: string;
  recordType?: string;
  board?: Ref;
  status?: Ref;
  priority?: Ref;
  company?: Ref;
  contact?: Ref;
  owner?: Ref;
  /** Comma-separated member identifiers assigned to the ticket. */
  resources?: string | null;
  closedFlag?: boolean;
  dateEntered?: string;
  _info?: Record<string, unknown>;
}

export interface Board extends Record<string, unknown> {
  id: number;
  name?: string;
  inactiveFlag?: boolean;
  department?: Ref;
  location?: Ref;
}

export interface BoardStatus extends Record<string, unknown> {
  id: number;
  name?: string;
  closedStatus?: boolean;
  defaultFlag?: boolean;
  sortOrder?: number;
  inactive?: boolean;
}

export interface BoardType extends Record<string, unknown> {
  id: number;
  name?: string;
  category?: Ref;
  defaultFlag?: boolean;
  inactiveFlag?: boolean;
}

export interface Priority extends Record<string, unknown> {
  id: number;
  name?: string;
  sortOrder?: number;
  defaultFlag?: boolean;
}

export interface TicketTask extends Record<string, unknown> {
  id: number;
  notes?: string;
  closedFlag?: boolean;
  priority?: number;
  resolution?: string;
}

export interface TicketNote extends Record<string, unknown> {
  id: number;
  text?: string;
  detailDescriptionFlag?: boolean;
  internalAnalysisFlag?: boolean;
  resolutionFlag?: boolean;
  member?: Ref;
  contact?: Ref;
  createdBy?: string;
  dateCreated?: string;
}

export interface TimeEntry extends Record<string, unknown> {
  id: number;
  chargeToId?: number;
  chargeToType?: string;
  member?: Ref;
  company?: Ref;
  timeStart?: string;
  timeEnd?: string;
  actualHours?: number;
  /** Break subtracted from the span: actualHours = (timeEnd − timeStart) − hoursDeduct. */
  hoursDeduct?: number;
  billableOption?: string;
  workRole?: Ref;
  workType?: Ref;
  notes?: string;
}

export interface WorkRole extends Record<string, unknown> {
  id: number;
  name?: string;
  hourlyRate?: number;
  inactiveFlag?: boolean;
}

export interface WorkType extends Record<string, unknown> {
  id: number;
  name?: string;
  /** How the type bills: Billable, DoNotBill, NoCharge, NoDefault. */
  billTime?: string;
  inactiveFlag?: boolean;
}

export interface Timesheet extends Record<string, unknown> {
  id: number;
  member?: Ref;
  year?: number;
  period?: number;
  dateStart?: string;
  dateEnd?: string;
  status?: string;
  hours?: number;
  deadline?: string;
}

export interface Company extends Record<string, unknown> {
  id: number;
  identifier?: string;
  name?: string;
  status?: Ref;
  types?: Ref[];
  addressLine1?: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  website?: string;
}

export interface CommunicationItem {
  type?: Ref;
  value?: string;
  defaultFlag?: boolean;
  communicationType?: string;
}

export interface Contact extends Record<string, unknown> {
  id: number;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: Ref;
  defaultPhoneNbr?: string;
  inactiveFlag?: boolean;
  communicationItems?: CommunicationItem[];
}

export interface Site extends Record<string, unknown> {
  id: number;
  name?: string;
  addressLine1?: string;
  city?: string;
  stateReference?: Ref;
  zip?: string;
  phoneNumber?: string;
  timeZone?: Ref;
  inactiveFlag?: boolean;
  primaryAddressFlag?: boolean;
}

export interface Configuration extends Record<string, unknown> {
  id: number;
  name?: string;
  type?: Ref;
  status?: Ref;
  company?: Ref;
  contact?: Ref;
  serialNumber?: string;
  modelNumber?: string;
  tagNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  osType?: string;
  osInfo?: string;
  warrantyExpirationDate?: string;
  activeFlag?: boolean;
  notes?: string;
}

export interface Member extends Record<string, unknown> {
  id: number;
  identifier: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  inactiveFlag?: boolean;
  timeZone?: Ref;
  /** Working-hours calendar reference (→ /schedule/calendars/{id}). */
  calendar?: Ref;
  workRole?: Ref;
  defaultLocation?: Ref;
  securityLocation?: Ref;
  type?: Ref;
  dailyCapacity?: number;
  scheduleCapacity?: number;
  restrictScheduleFlag?: boolean;
  hideMemberInDispatchPortalFlag?: boolean;
  officeEmail?: string;
  primaryEmail?: string;
}

/** Working-hours calendar (/schedule/calendars) — start/end per weekday + holidays. */
export interface Calendar extends Record<string, unknown> {
  id: number;
  name?: string;
  holidayList?: Ref;
  mondayStartTime?: string;
  mondayEndTime?: string;
  tuesdayStartTime?: string;
  tuesdayEndTime?: string;
  wednesdayStartTime?: string;
  wednesdayEndTime?: string;
  thursdayStartTime?: string;
  thursdayEndTime?: string;
  fridayStartTime?: string;
  fridayEndTime?: string;
  saturdayStartTime?: string;
  saturdayEndTime?: string;
  sundayStartTime?: string;
  sundayEndTime?: string;
}

/** Schedule entry (/schedule/entries) — a dispatch/appointment slot. */
export interface ScheduleEntry extends Record<string, unknown> {
  id: number;
  /** The scheduled object's id (e.g. the ticket id when type is a service ticket). */
  objectId?: number;
  name?: string;
  member?: Ref;
  status?: Ref;
  type?: Ref;
  dateStart?: string;
  dateEnd?: string;
  hours?: number;
  doneFlag?: boolean;
}

/** Invoice (/finance/invoices). */
export interface Invoice extends Record<string, unknown> {
  id: number;
  invoiceNumber?: string;
  type?: string;
  status?: Ref;
  company?: Ref;
  date?: string;
  dueDate?: string;
  total?: number;
  balance?: number;
}

/** Agreement (/finance/agreements) — a service contract. */
export interface Agreement extends Record<string, unknown> {
  id: number;
  name?: string;
  type?: Ref;
  company?: Ref;
  agreementStatus?: string;
  startDate?: string;
  endDate?: string;
  billAmount?: number;
  billingCycle?: Ref;
  cancelledFlag?: boolean;
  noEndingDateFlag?: boolean;
  applicationUnits?: string;
  applicationLimit?: number;
  applicationCycle?: string;
  applicationUnlimitedFlag?: boolean;
}
