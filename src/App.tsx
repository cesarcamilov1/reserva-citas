import { useMemo } from 'react'
import { loadEnv } from './config/env'
import { createHttpClient } from './features/booking/infrastructure/http/httpClient'
import { createPublicBookingApi } from './features/booking/infrastructure/http/publicBookingApi'
import { AppointmentManage } from './features/booking/ui/AppointmentManage'
import { BookingFlow } from './features/booking/ui/BookingFlow'

function App() {
  const env = useMemo(() => loadEnv(), [])
  const gateway = useMemo(
    () => createPublicBookingApi(createHttpClient({ baseUrl: env.apiBaseUrl })),
    [env.apiBaseUrl],
  )
  const publicRef = useMemo(() => new URLSearchParams(window.location.search).get('ref'), [])

  if (!env.providerUserId) {
    return (
      <div role="alert" style={{ padding: 24, fontFamily: 'sans-serif' }}>
        Falta configurar VITE_PROVIDER_USER_ID. Define esta variable de entorno para poder cargar la agenda.
      </div>
    )
  }

  if (publicRef) {
    return <AppointmentManage gateway={gateway} publicRef={publicRef} />
  }

  return <BookingFlow gateway={gateway} providerUserId={env.providerUserId} />
}

export default App
