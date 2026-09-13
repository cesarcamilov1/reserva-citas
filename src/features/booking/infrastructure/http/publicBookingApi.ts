import type {
  AvailabilitySlot,
  BookableService,
  CreateAppointmentInput,
  GetAvailabilityParams,
  Location,
  OtpChallenge,
  PublicAppointment,
  PublicBookingGateway,
} from '../../application/ports/PublicBookingGateway'
import type { HttpClient } from './httpClient'

const API_PREFIX = '/api/v1/public'

interface LocationDto {
  id: string
  provider_user_id: string
  name: string
  address: string
  is_active: boolean
  is_default: boolean
  all_services: boolean
  travel_buffer_minutes: number
}

interface LocationListDto {
  items: LocationDto[]
}

interface CatalogServiceDto {
  id: string
  code: string
  name: string
  description?: string
  duration_minutes: number
  default_price: string
  currency: 'MXN'
  is_active: boolean
  created_at: string
  updated_at: string
  version: number
}

interface ServiceListDto {
  items: CatalogServiceDto[]
}

interface AvailabilitySlotDto {
  starts_at: string
  ends_at: string
}

interface AvailabilityResponseDto {
  slots: AvailabilitySlotDto[]
}

interface BookingOtpChallengeDto {
  challenge: string
  message: string
}

interface BookingVerificationTokenDto {
  verification_token: string
}

interface PublicAppointmentDto {
  location_id?: string
  public_ref: string
  status: PublicAppointment['status']
  starts_at: string
  ends_at: string
}

export function createPublicBookingApi(httpClient: HttpClient): PublicBookingGateway {
  return {
    async listLocations(providerUserId) {
      const response = await httpClient.get<LocationListDto>(`${API_PREFIX}/locations`, {
        query: { provider_user_id: providerUserId },
      })
      return response.items.map(mapLocation)
    },

    async listLocationServices(providerUserId, locationId) {
      const response = await httpClient.get<ServiceListDto>(
        `${API_PREFIX}/locations/${encodeURIComponent(locationId)}/services`,
        { query: { provider_user_id: providerUserId } },
      )
      return response.items.map(mapService)
    },

    async getAvailability(params: GetAvailabilityParams) {
      const response = await httpClient.get<AvailabilityResponseDto>(`${API_PREFIX}/availability`, {
        query: {
          provider_user_id: params.providerUserId,
          service_id: params.serviceId,
          from: params.from,
          to: params.to,
          location_id: params.locationId,
        },
      })
      return response.slots.map(mapSlot)
    },

    async requestOtp(phoneE164) {
      const response = await httpClient.post<BookingOtpChallengeDto>(`${API_PREFIX}/booking-verifications`, {
        body: { phone_e164: phoneE164 },
      })
      return mapOtpChallenge(response)
    },

    async verifyOtp(challenge, code) {
      const response = await httpClient.post<BookingVerificationTokenDto>(
        `${API_PREFIX}/booking-verifications/verify`,
        { body: { challenge, code } },
      )
      return response.verification_token
    },

    async createAppointment(input: CreateAppointmentInput, idempotencyKey) {
      const response = await httpClient.post<PublicAppointmentDto>(`${API_PREFIX}/appointments`, {
        headers: { 'Idempotency-Key': idempotencyKey },
        body: {
          verification_token: input.verificationToken,
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          provider_user_id: input.providerUserId,
          location_id: input.locationId,
          service_ids: input.serviceIds,
          starts_at: input.startsAt,
          reason: input.reason,
        },
      })
      return mapAppointment(response)
    },

    async getAppointment(publicRef) {
      const response = await httpClient.get<PublicAppointmentDto>(
        `${API_PREFIX}/appointments/${encodeURIComponent(publicRef)}`,
      )
      return mapAppointment(response)
    },

    async confirmAppointment(publicRef, idempotencyKey) {
      const response = await httpClient.post<PublicAppointmentDto>(
        `${API_PREFIX}/appointments/${encodeURIComponent(publicRef)}/confirm`,
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      return mapAppointment(response)
    },

    async cancelAppointment(publicRef, idempotencyKey) {
      const response = await httpClient.post<PublicAppointmentDto>(
        `${API_PREFIX}/appointments/${encodeURIComponent(publicRef)}/cancel`,
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      return mapAppointment(response)
    },
  }
}

function mapLocation(dto: LocationDto): Location {
  return {
    id: dto.id,
    providerUserId: dto.provider_user_id,
    name: dto.name,
    address: dto.address,
    isActive: dto.is_active,
    isDefault: dto.is_default,
    allServices: dto.all_services,
    travelBufferMinutes: dto.travel_buffer_minutes,
  }
}

function mapService(dto: CatalogServiceDto): BookableService {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description,
    durationMinutes: dto.duration_minutes,
    defaultPrice: dto.default_price,
    currency: dto.currency,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    version: dto.version,
  }
}

function mapSlot(dto: AvailabilitySlotDto): AvailabilitySlot {
  return { startsAt: dto.starts_at, endsAt: dto.ends_at }
}

function mapOtpChallenge(dto: BookingOtpChallengeDto): OtpChallenge {
  return { challenge: dto.challenge, message: dto.message }
}

function mapAppointment(dto: PublicAppointmentDto): PublicAppointment {
  return {
    publicRef: dto.public_ref,
    status: dto.status,
    startsAt: dto.starts_at,
    endsAt: dto.ends_at,
    locationId: dto.location_id,
  }
}
