export interface FieldError {
  field: string
  code: string
  message: string
}

export interface ApiErrorInit {
  status: number
  code: string
  title?: string
  detail?: string
  requestId?: string
  fieldErrors?: FieldError[]
}

interface ProblemLike {
  type?: string
  title?: string
  status?: number
  code?: string
  detail?: string
  request_id?: string
  errors?: FieldError[]
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly title?: string
  readonly detail?: string
  readonly requestId?: string
  readonly fieldErrors?: FieldError[]

  constructor(init: ApiErrorInit) {
    super(init.detail ?? init.title ?? init.code)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.title = init.title
    this.detail = init.detail
    this.requestId = init.requestId
    this.fieldErrors = init.fieldErrors
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const body = await parseProblemBody(response)

    if (body) {
      return new ApiError({
        status: typeof body.status === 'number' ? body.status : response.status,
        code: body.code ?? 'UNKNOWN_ERROR',
        title: body.title,
        detail: body.detail,
        requestId: body.request_id,
        fieldErrors: body.errors,
      })
    }

    return new ApiError({
      status: response.status,
      code: 'UNKNOWN_ERROR',
    })
  }

  static fromNetworkError(cause: unknown): ApiError {
    const detail = cause instanceof Error ? cause.message : String(cause)
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      detail,
    })
  }
}

async function parseProblemBody(response: Response): Promise<ProblemLike | undefined> {
  let text: string
  try {
    text = await response.text()
  } catch {
    return undefined
  }

  if (!text) {
    return undefined
  }

  try {
    const parsed: unknown = JSON.parse(text)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as ProblemLike
    }
    return undefined
  } catch {
    return undefined
  }
}
