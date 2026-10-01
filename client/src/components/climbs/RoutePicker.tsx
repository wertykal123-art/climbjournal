import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Search, Plus, Check, Clock, MapPin } from 'lucide-react'
import { Route } from '@/types/models'
import GradeBadge from '@/components/routes/GradeBadge'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { compareGrades, frenchToUIAA } from '@/utils/grades'

interface RoutePickerProps {
  routes: Route[]
  value: string
  onChange: (routeId: string) => void
  /** Most recently climbed route ids, newest first. */
  recentRouteIds?: string[]
  /** Location to list first (e.g. the gym you last logged at). */
  preferredLocationId?: string | null
  /** Offer "New route" (receives the current search text as a name hint). */
  onCreateNew?: (nameHint: string) => void
  disabled?: boolean
}

interface Section {
  key: string
  title?: string
  icon?: typeof Clock
  routes: Route[]
}

const byName = (a: Route, b: Route) => a.name.localeCompare(b.name)

export default function RoutePicker({
  routes,
  value,
  onChange,
  recentRouteIds = [],
  preferredLocationId,
  onCreateNew,
  disabled,
}: RoutePickerProps) {
  const { getGradeBadgeSystem, getEffectiveSystem } = useGradingSystem()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(!value)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const selected = routes.find((r) => r.id === value)

  // If a value arrives later (e.g. a newly created route), collapse.
  useEffect(() => {
    if (value) setExpanded(false)
  }, [value])

  const sections: Section[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      const matches = routes.filter((r) => {
        const grade = r.difficultyFrench.toLowerCase()
        const uiaa = frenchToUIAA(r.difficultyFrench).toLowerCase()
        return (
          r.name.toLowerCase().includes(q) ||
          (r.visualId ?? '').toLowerCase().includes(q) ||
          (r.location?.name ?? '').toLowerCase().includes(q) ||
          grade.startsWith(q) ||
          uiaa.startsWith(q)
        )
      })
      // Name-prefix matches first, then by grade.
      matches.sort((a, b) => {
        const ap = a.name.toLowerCase().startsWith(q) ? 0 : 1
        const bp = b.name.toLowerCase().startsWith(q) ? 0 : 1
        return ap - bp || compareGrades(a.difficultyFrench, b.difficultyFrench)
      })
      return [{ key: 'results', routes: matches.slice(0, 50) }]
    }

    const byId = new Map(routes.map((r) => [r.id, r]))
    const recent = recentRouteIds.map((id) => byId.get(id)).filter((r): r is Route => !!r).slice(0, 5)
    const used = new Set(recent.map((r) => r.id))
    const here = routes
      .filter((r) => preferredLocationId && r.locationId === preferredLocationId && !used.has(r.id))
      .sort((a, b) => compareGrades(a.difficultyFrench, b.difficultyFrench) || byName(a, b))
    here.forEach((r) => used.add(r.id))
    const rest = routes
      .filter((r) => !used.has(r.id))
      .sort((a, b) => (a.location?.name ?? '').localeCompare(b.location?.name ?? '') || compareGrades(a.difficultyFrench, b.difficultyFrench))

    const out: Section[] = []
    if (recent.length) out.push({ key: 'recent', title: 'Recently climbed', icon: Clock, routes: recent })
    if (here.length) out.push({ key: 'here', title: `At ${here[0].location?.name ?? 'this location'}`, icon: MapPin, routes: here })
    if (rest.length) out.push({ key: 'rest', title: out.length ? 'All other routes' : undefined, routes: rest })
    return out
  }, [routes, query, recentRouteIds, preferredLocationId])

  const flat = useMemo(() => sections.flatMap((s) => s.routes), [sections])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const choose = (route: Route) => {
    onChange(route.id)
    setQuery('')
    setExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flat[activeIndex]) choose(flat[activeIndex])
    } else if (e.key === 'Escape' && selected) {
      e.preventDefault()
      e.stopPropagation()
      setExpanded(false)
      setQuery('')
    }
  }

  const gradeLabel = (r: Route) =>
    getEffectiveSystem(r.location) === 'UIAA' ? frenchToUIAA(r.difficultyFrench) : r.difficultyFrench

  if (selected && !expanded) {
    return (
      <div>
        <span className="block text-sm font-medium text-rock-700 mb-1">Route</span>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-rock-300 bg-white">
          <GradeBadge grade={selected.difficultyFrench} system={getGradeBadgeSystem(selected.location)} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-rock-900 truncate flex items-center gap-2">
              <span className="truncate">{selected.name}</span>
              {selected.color && (
                <span className="w-3 h-3 rounded-full border border-rock-300 shrink-0" style={{ backgroundColor: selected.color }} aria-hidden="true" />
              )}
            </p>
            {selected.location?.name && <p className="text-xs text-rock-500 truncate">{selected.location.name}</p>}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => {
                setExpanded(true)
                requestAnimationFrame(() => inputRef.current?.focus())
              }}
              className="text-sm font-medium text-carabiner hover:underline shrink-0 rounded px-1"
            >
              Change
            </button>
          )}
        </div>
      </div>
    )
  }

  let index = -1

  return (
    <div>
      <label htmlFor={`${listId}-input`} className="block text-sm font-medium text-rock-700 mb-1">
        Route
      </label>
      <div className="rounded-lg border border-rock-300 bg-white focus-within:ring-2 focus-within:ring-carabiner focus-within:border-transparent">
        <div className="relative border-b border-rock-200">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rock-400 pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={flat[activeIndex] ? `${listId}-${flat[activeIndex].id}` : undefined}
            autoComplete="off"
            placeholder="Search name, grade, or gym…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-3 py-2.5 rounded-t-lg text-rock-900 placeholder:text-rock-400 focus:outline-none bg-transparent"
          />
        </div>
        <ul ref={listRef} id={listId} role="listbox" aria-label="Routes" className="max-h-64 overflow-y-auto overscroll-contain py-1">
          {sections.map((section) => (
            <li key={section.key} role="presentation">
              {section.title && (
                <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-rock-500">
                  {section.icon && <section.icon className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span className="truncate">{section.title}</span>
                </div>
              )}
              <ul role="presentation">
                {section.routes.map((route) => {
                  index++
                  const i = index
                  const isActive = i === activeIndex
                  const isSelected = route.id === value
                  return (
                    <li
                      key={`${section.key}-${route.id}`}
                      id={`${listId}-${route.id}`}
                      role="option"
                      aria-selected={isSelected}
                      data-index={i}
                      onMouseMove={() => setActiveIndex(i)}
                      onClick={() => choose(route)}
                      className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${isActive ? 'bg-carabiner-light' : ''}`}
                    >
                      <GradeBadge grade={route.difficultyFrench} size="sm" system={getGradeBadgeSystem(route.location)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-rock-900 truncate flex items-center gap-1.5">
                          <span className="truncate">{route.name}</span>
                          {route.color && (
                            <span className="w-2.5 h-2.5 rounded-full border border-rock-300 shrink-0" style={{ backgroundColor: route.color }} aria-hidden="true" />
                          )}
                        </p>
                        <p className="text-xs text-rock-500 truncate">
                          {route.location?.name}
                          {route.visualId && ` · ${route.visualId}`}
                          <span className="sr-only">, grade {gradeLabel(route)}</span>
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-carabiner shrink-0" aria-hidden="true" />}
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
          {flat.length === 0 && (
            <li className="px-3 py-4 text-sm text-rock-500 text-center" role="presentation">
              {query ? `No routes match "${query.trim()}".` : 'No routes yet.'}
            </li>
          )}
        </ul>
        {onCreateNew && (
          <button
            type="button"
            onClick={() => onCreateNew(query.trim())}
            className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-rock-200 text-sm font-medium text-carabiner hover:bg-carabiner-light rounded-b-lg"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {query.trim() ? `New route "${query.trim()}"` : 'New route'}
          </button>
        )}
      </div>
      {selected && (
        <button
          type="button"
          onClick={() => {
            setExpanded(false)
            setQuery('')
          }}
          className="mt-1 text-xs text-rock-500 hover:text-rock-700 underline"
        >
          Keep {selected.name}
        </button>
      )}
    </div>
  )
}
