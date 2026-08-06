const SEGMENTS = 20

type Props = { eaten: number; target: number }

/** 20 discrete segments, each 5% of the day's target, filling left to right. */
export function BudgetMeter({ eaten, target }: Props) {
  const ratio = target > 0 ? eaten / target : 0
  const filled = Math.min(SEGMENTS, Math.round(ratio * SEGMENTS))
  const over = ratio > 1

  return (
    <div
      className="meter"
      role="img"
      aria-label={`${Math.round(ratio * 100)}% of the daily calorie budget used`}
    >
      {Array.from({ length: SEGMENTS }, (_, index) => {
        const state = index < filled ? (over && index === SEGMENTS - 1 ? 'over' : 'filled') : 'empty'
        return (
          <span
            key={index}
            className={`meter-segment ${state}`}
            style={{ transitionDelay: `${index * 22}ms` }}
          />
        )
      })}
    </div>
  )
}
