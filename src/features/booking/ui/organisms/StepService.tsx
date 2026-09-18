import { useId, useState } from 'react'
import type { BookableService } from '../../application/ports/PublicBookingGateway'
import { formatDurationMinutes, formatPriceMXN } from '../../domain/formatting'
import { TextField } from '../atoms/TextField'
import { ServiceCard } from '../molecules/ServiceCard'
import { StepHeading } from './StepHeading'
import styles from './StepService.module.css'

const PAGE_SIZE = 6
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

interface StepServiceProps {
  serviceId: string
  services: BookableService[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onSelectService: (serviceId: string) => void
}

export function StepService({ serviceId, services, loading, error, onRetry, onSelectService }: StepServiceProps) {
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const normalizedQuery = normalizeSearch(query)
  const filteredServices = services.filter((service) => normalizeSearch(service.name).includes(normalizedQuery))
  const pageCount = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE))
  const page = Math.min(pageIndex, pageCount - 1)
  const start = page * PAGE_SIZE
  const visibleServices = filteredServices.slice(start, start + PAGE_SIZE)

  function updateSearch(value: string) {
    setQuery(value)
    setPageIndex(0)
  }

  return (
    <div className={styles.step}>
      <StepHeading
        title="¿Qué necesitas atender?"
        subtitle="Los precios y la duración son de referencia. Se confirman al llegar al consultorio."
      />

      {loading && <div className={styles.status}>Cargando servicios…</div>}

      {!loading && error && (
        <div className={styles.status} role="alert">
          {error}
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        services.length === 0 ? (
          <div className={styles.status}>No hay servicios disponibles en esta sede.</div>
        ) : (
          <div className={styles.catalog}>
            <div className={styles.search}>
              <TextField
                id={searchId}
                type="search"
                label="Buscar servicio"
                placeholder="Escribe el nombre del servicio"
                value={query}
                onChange={(event) => updateSearch(event.target.value)}
              />
              <button type="button" className={styles.control} disabled={!query} onClick={() => updateSearch('')}>
                Limpiar búsqueda
              </button>
            </div>

            <p className={styles.resultCount} role="status" aria-atomic="true">
              {filteredServices.length > 0
                ? `Mostrando ${start + 1}–${start + visibleServices.length} de ${filteredServices.length} ${filteredServices.length === 1 ? 'servicio' : 'servicios'}`
                : 'No encontramos servicios con esa búsqueda.'}
            </p>

            <div className={styles.list}>
              {visibleServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  name={service.name}
                  priceLabel={formatPriceMXN(service.defaultPrice)}
                  durationLabel={formatDurationMinutes(service.durationMinutes)}
                  selected={service.id === serviceId}
                  onSelect={() => onSelectService(service.id)}
                />
              ))}
            </div>

            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Páginas de servicios">
                <button type="button" className={styles.control} disabled={page === 0} onClick={() => setPageIndex(page - 1)}>
                  Anterior
                </button>
                <span className={styles.pageNumber}>Página {page + 1} de {pageCount}</span>
                <button type="button" className={styles.control} disabled={page === pageCount - 1} onClick={() => setPageIndex(page + 1)}>
                  Siguiente
                </button>
              </nav>
            )}

          </div>
        )
      )}
    </div>
  )
}
