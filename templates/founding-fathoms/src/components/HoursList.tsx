import { useBrewery } from '../app/BreweryContext';
import { hoursRows } from '../lib/hours';

/** The weekly hours as a definition list, with the reason for the closed days beside them. */
export function HoursList({ className = '' }: { className?: string }) {
  const { hours } = useBrewery();
  return (
    <dl className={`grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 ${className}`}>
      {hoursRows(hours.schedule).map((row) => (
        <div key={row.days} className="contents">
          <dt>{row.days}</dt>
          <dd className={row.closed ? 'text-mist' : 'font-semibold text-brass'}>
            {row.hours}
            {row.closed && hours.closedNote ? ` (${hours.closedNote})` : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
