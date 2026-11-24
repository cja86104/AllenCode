import { useMemorial, useNow, useServicePreview } from '../app/MemorialContext';
import type { Gathering as GatheringData, GatheringEvent } from '../content/types';
import { SECTION_IDS } from '../lib/navigation';
import { eventIcs, formatEventDate, formatEventTime, serviceState, type ServiceState } from '../lib/service';

interface DetailRow {
  label: string;
  value: string;
}

function detailRows(event: GatheringEvent, includeLogistics: boolean): DetailRow[] {
  const rows: DetailRow[] = [];
  const date = formatEventDate(event);
  const time = formatEventTime(event);
  if (date) rows.push({ label: 'Date', value: date });
  if (time) rows.push({ label: 'Time', value: `${time} ${event.timeZoneLabel}` });
  const place = [event.venue, event.address, event.city].filter(Boolean).join(', ');
  if (place) rows.push({ label: 'Place', value: place });
  if (!includeLogistics) return rows;
  if (event.directions) rows.push({ label: 'Directions', value: event.directions });
  if (event.parking) rows.push({ label: 'Parking and arrival', value: event.parking });
  if (event.accessibility) rows.push({ label: 'Accessibility', value: event.accessibility });
  if (event.dress) rows.push({ label: 'What to wear', value: event.dress });
  if (event.reception) rows.push({ label: 'Afterward', value: event.reception });
  return rows;
}

function mapUrl(event: GatheringEvent): string | undefined {
  if (!event.address) return undefined;
  const query = [event.venue, event.address, event.city].filter(Boolean).join(', ');
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

function EventActions({ event, personName, now }: { event: GatheringEvent; personName: string; now: number }) {
  const map = mapUrl(event);
  const ics = event.offerCalendar ? eventIcs(event, personName, now) : undefined;
  const actions = [
    event.rsvp ? (
      <a key="rsvp" className="button" href={event.rsvp.url} rel="noopener">
        {event.rsvp.label}
      </a>
    ) : null,
    event.livestream ? (
      <a key="live" className="text-link" href={event.livestream.url} rel="noopener">
        {event.livestream.label}
      </a>
    ) : null,
    ics ? (
      <a key="ics" className="text-link" href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download={`${event.id}.ics`}>
        Add to calendar
      </a>
    ) : null,
    map ? (
      <a key="map" className="text-link" href={map} rel="noopener">
        Open the address in a map
      </a>
    ) : null,
  ].filter((action) => action !== null);
  if (actions.length === 0) return null;
  return <p className="gathering__actions">{actions}</p>;
}

interface GatheringViewProps {
  gathering: GatheringData;
  state: ServiceState;
  personName: string;
  now: number;
  /** The heading level inside a preview panel can be lower than on the memorial. */
  headingId?: string;
}

/**
 * The gathering section in one of its three states. The public memorial picks the state from the
 * family setting and the event time; the management preview renders each state directly.
 */
export function GatheringView({ gathering, state, personName, now, headingId = 'gathering-heading' }: GatheringViewProps) {
  return (
    <div className={`gathering gathering--${state}`}>
      <header className="section-head section-head--narrow">
        <h2 id={headingId} className="section-head__title">
          {gathering.heading}
        </h2>
      </header>

      {state === 'private' ? (
        <div className="gathering__body prose">
          <p>{gathering.privateNote ?? 'The family will share details of the gathering privately.'}</p>
        </div>
      ) : null}

      {state === 'past' ? (
        <div className="gathering__body">
          {gathering.events.map((event) => (
            <div key={event.id} className="gathering__event">
              <p className="gathering__status">Took place</p>
              <h3 className="gathering__title">{event.title}</h3>
              <dl className="details">
                {detailRows(event, false).map((row) => (
                  <div key={row.label} className="details__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          {gathering.afterNote ? <p className="gathering__note">{gathering.afterNote}</p> : null}
        </div>
      ) : null}

      {state === 'upcoming' ? (
        <div className="gathering__body">
          {gathering.events.map((event) => (
            <div key={event.id} className="gathering__event">
              <h3 className="gathering__title">{event.title}</h3>
              {event.note ? <p className="gathering__note">{event.note}</p> : null}
              <dl className="details">
                {detailRows(event, true).map((row) => (
                  <div key={row.label} className="details__row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
              <EventActions event={event} personName={personName} now={now} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Gathering() {
  const memorial = useMemorial();
  const now = useNow();
  const preview = useServicePreview();
  const { gathering } = memorial;
  const state = preview ?? serviceState(gathering, now);
  if (!gathering || state === 'none') return null;

  return (
    <section id={SECTION_IDS.gathering} className="section section--band" aria-labelledby="gathering-heading">
      <GatheringView gathering={gathering} state={state} personName={memorial.person.displayName} now={now} />
    </section>
  );
}
