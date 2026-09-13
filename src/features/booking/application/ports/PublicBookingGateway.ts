export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface Location {
  id: string
  providerUserId: string
  name: string
  address: string
  isActive: boolean
  isDefault: boolean
  allServices: boolean
  travelBufferMinutes: number
}

export interface BookableService {
  id: string
  code: string
  name: string
  description?: string
  durationMinutes: number
  /** Decimal string, e.g. "450.00". */
  defaultPrice: string
  currency: 'MXN'
  isActive: boolean
  createdAt: string
  updatedAt: string
  version: number
}

export interface AvailabilitySlot {
  startsAt: string
  endsAt: string
}

export interface OtpChallenge {
  challenge: string
  message: string
}

export interface PublicAppointment {
  publicRef: string
  status: AppointmentStatus
  startsAt: string
  endsAt: string
  locationId?: string
}

export interface GetAvailabilityParams {
  providerUserId: string
  serviceId: string
  from: string
  to: string
  locationId?: string
}

export interface CreateAppointmentInput {
  verificationToken: string
  firstName: string
  lastName: string
  email?: string
  providerUserId: string
  locationId?: string
  serviceIds: string[]
  startsAt: string
  reason?: string
}

export interface PublicBookingGateway {
  listLocations(providerUserId: string): Promise<Location[]>
  listLocationServices(providerUserId: string, locationId: string): Promise<BookableService[]>
  getAvailability(params: GetAvailabilityParams): Promise<AvailabilitySlot[]>
  requestOtp(phoneE164: string): Promise<OtpChallenge>
  verifyOtp(challenge: string, code: string): Promise<string>
  createAppointment(input: CreateAppointmentInput, idempotencyKey: string): Promise<PublicAppointment>
  getAppointment(publicRef: string): Promise<PublicAppointment>
  confirmAppointment(publicRef: string, idempotencyKey: string): Promise<PublicAppointment>
  cancelAppointment(publicRef: string, idempotencyKey: string): Promise<PublicAppointment>
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID()
}
