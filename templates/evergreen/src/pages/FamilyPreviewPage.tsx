import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useMemorial, useNow } from '../app/MemorialContext';
import { usePageTitle } from '../app/usePageTitle';
import { Photo } from '../components/Photo';
import { pendingMemories, type PendingMemory } from '../content/demoModeration';
import type { AppearancePreset, PrivacyMode } from '../content/types';
import { featuredPhotos, findPhoto } from '../lib/content';
import { PRIVACY_MODES } from '../lib/privacy';
import { serviceState, type ServiceState } from '../lib/service';
import { GatheringView } from '../sections/Gathering';
import { PRESETS, presetVariables } from '../theme/presets';
import { NotFoundPage } from './NotFoundPage';

type Decision = 'waiting' | 'approved' | 'private' | 'declined';

const DECISION_LABEL: Record<Exclude<Decision, 'waiting'>, string> = {
  approved: 'Approved: will appear on the memorial',
  private: 'Kept private: the family can read it, visitors cannot',
  declined: 'Declined: not published',
};

const STATE_OPTIONS: { id: Exclude<ServiceState, 'none'>; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Has taken place' },
  { id: 'private', label: 'Details shared privately' },
];

function PanelHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <header className="panel__head">
      <h2 id={id} className="panel__title">
        {title}
      </h2>
      {children ? <p className="panel__intro">{children}</p> : null}
    </header>
  );
}

/**
 * A demonstration of the family area, with the template's own demonstration content. Every control here
 * works, but only inside this page: nothing is saved, nothing is sent, and the page is not protected.
 * It is reachable only on the template's demonstration memorial (`site.demonstration`).
 */
export function FamilyPreviewPage() {
  const memorial = useMemorial();
  if (!memorial.site.demonstration) return <NotFoundPage />;
  return <FamilyPreview />;
}

function FamilyPreview() {
  const memorial = useMemorial();
  const now = useNow();
  usePageTitle('Family area (demonstration)');
  const base = useId();

  const gathering = memorial.gathering;
  const firstEvent = gathering?.events[0];
  const automaticState = serviceState(gathering, now);
  const [servicePreview, setServicePreview] = useState<Exclude<ServiceState, 'none'>>(
    automaticState === 'none' ? 'upcoming' : automaticState,
  );
  const [eventTitle, setEventTitle] = useState(firstEvent?.title ?? '');
  const [eventDate, setEventDate] = useState(firstEvent?.start.slice(0, 10) ?? '');
  const [eventTime, setEventTime] = useState(firstEvent?.start.slice(11, 16) ?? '');

  const [decisions, setDecisions] = useState<Record<string, Decision>>(() =>
    Object.fromEntries(pendingMemories.map((memory) => [memory.id, 'waiting'])),
  );
  const [order, setOrder] = useState(() => featuredPhotos(memorial).map((photo) => photo.id));
  const [intro, setIntro] = useState(memorial.opening.intro);
  const portrait = findPhoto(memorial, memorial.opening.portraitId);
  const [focal, setFocal] = useState(() => portrait?.focalPoint ?? { x: 50, y: 50 });
  const [preset, setPreset] = useState<AppearancePreset>(memorial.site.appearance);
  const [mode, setMode] = useState<PrivacyMode>(memorial.privacy.mode);
  const [recipeOn, setRecipeOn] = useState(memorial.modules.recipe?.enabled ?? false);
  const [gatheringOn, setGatheringOn] = useState(gathering !== undefined);
  const [acceptMemories, setAcceptMemories] = useState(memorial.privacy.acceptMemories);

  const previewGathering =
    gathering && firstEvent
      ? {
          ...gathering,
          visibility: servicePreview === 'private' ? ('private' as const) : ('public' as const),
          events: [
            {
              ...firstEvent,
              title: eventTitle.trim() || firstEvent.title,
              start:
                /^\d{4}-\d{2}-\d{2}$/.test(eventDate) && /^\d{2}:\d{2}$/.test(eventTime) ? `${eventDate}T${eventTime}` : firstEvent.start,
            },
          ],
        }
      : undefined;

  const move = (index: number, by: -1 | 1) => {
    setOrder((current) => {
      const next = [...current];
      const target = index + by;
      const [item] = next.splice(index, 1);
      if (item === undefined || target < 0 || target > next.length) return current;
      next.splice(target, 0, item);
      return next;
    });
  };

  const exportContent = () => {
    const blob = new Blob([JSON.stringify(memorial, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'memorial-content.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const presetStyle = Object.fromEntries(presetVariables(preset)) as CSSProperties;
  const decide = (memory: PendingMemory, decision: Decision) => setDecisions((current) => ({ ...current, [memory.id]: decision }));
  const visibleSections = [
    'Opening',
    'The things we remember',
    memorial.person.pronouns.lifeLabel,
    'Photographs',
    gatheringOn ? 'Gathering' : null,
    acceptMemories || memorial.memories.items.length > 0 ? 'Memories' : null,
    recipeOn ? (memorial.modules.recipe?.heading ?? 'Recipe') : null,
    'Closing note',
  ].filter((section): section is string => section !== null);

  return (
    <div className="family-preview">
      <div className="family-preview__banner" role="note">
        <p className="family-preview__banner-title">Demonstration of the family area</p>
        <p>
          Everything on this page works, but only here: nothing is saved or sent, and this page is not protected. A published memorial keeps
          the family area behind real sign-in.
        </p>
      </div>

      <div className="section family-preview__body">
        <header className="section-head section-head--narrow">
          <p className="photographs__back">
            <Link className="text-link" to="/family">
              Family access
            </Link>
          </p>
          <h1 className="section-head__title">Looking after {memorial.person.displayName}’s memorial</h1>
        </header>

        <nav className="family-preview__toc" aria-label="Family area">
          <ul>
            <li>
              <a href={`#${base}-memories`}>Memories to review</a>
            </li>
            <li>
              <a href={`#${base}-gathering`}>Gathering</a>
            </li>
            <li>
              <a href={`#${base}-photos`}>Photographs</a>
            </li>
            <li>
              <a href={`#${base}-words`}>Opening words</a>
            </li>
            <li>
              <a href={`#${base}-sections`}>Sections</a>
            </li>
            <li>
              <a href={`#${base}-appearance`}>Appearance</a>
            </li>
            <li>
              <a href={`#${base}-privacy`}>Who can see it</a>
            </li>
            <li>
              <a href={`#${base}-export`}>Export</a>
            </li>
          </ul>
        </nav>

        <section className="panel" aria-labelledby={`${base}-memories`}>
          <PanelHeading id={`${base}-memories`} title="Memories to review">
            New memories wait here until someone in the family reads them. Nothing is ranked; they arrive in the order they were shared.
          </PanelHeading>
          <ul className="review-list">
            {pendingMemories.map((memory) => {
              const decision = decisions[memory.id] ?? 'waiting';
              return (
                <li key={memory.id} className="review">
                  <p className="memory__byline">
                    <span className="memory__author">{memory.author}</span>
                    {memory.relationship ? <span className="memory__relationship">, {memory.relationship}</span> : null}
                  </p>
                  <div className="prose review__text">
                    {memory.text.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <ul className="review__facts">
                    <li>{memory.displayPermission ? 'May be shown on the memorial' : 'Asked to share with the family only'}</li>
                    <li>{memory.leftEmail ? 'Left an email address for a reply' : 'No email address'}</li>
                    {memory.photoNote ? <li>{memory.photoNote}</li> : null}
                  </ul>
                  {decision === 'waiting' ? (
                    <div className="review__actions" role="group" aria-label={`Decide on the memory from ${memory.author}`}>
                      {memory.displayPermission ? (
                        <button type="button" className="button" onClick={() => decide(memory, 'approved')}>
                          Approve
                        </button>
                      ) : null}
                      <button type="button" className="button" onClick={() => decide(memory, 'private')}>
                        Keep private
                      </button>
                      <button type="button" className="text-button" onClick={() => decide(memory, 'declined')}>
                        Decline
                      </button>
                    </div>
                  ) : (
                    <p className="review__decision" role="status">
                      {DECISION_LABEL[decision]} (in this demonstration only).{' '}
                      <button type="button" className="text-button" onClick={() => decide(memory, 'waiting')}>
                        Undo
                      </button>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {previewGathering ? (
          <section className="panel" aria-labelledby={`${base}-gathering`}>
            <PanelHeading id={`${base}-gathering`} title="Gathering">
              The public memorial decides this by itself from the date and time: right now it shows “
              {STATE_OPTIONS.find((option) => option.id === automaticState)?.label ?? 'nothing'}”. Use the controls to see each version.
            </PanelHeading>
            <div className="panel__controls">
              <fieldset className="choice">
                <legend className="field__label">Show the gathering as</legend>
                {STATE_OPTIONS.map((option) => (
                  <label key={option.id} className="choice__option">
                    <input
                      type="radio"
                      name={`${base}-state`}
                      value={option.id}
                      checked={servicePreview === option.id}
                      onChange={() => setServicePreview(option.id)}
                    />
                    {option.label}
                  </label>
                ))}
              </fieldset>
              <div className="panel__fields">
                <label className="field">
                  <span className="field__label">Title</span>
                  <input className="field__input" type="text" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} />
                </label>
                <label className="field">
                  <span className="field__label">Date</span>
                  <input className="field__input" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
                </label>
                <label className="field">
                  <span className="field__label">Start time ({firstEvent?.timeZoneLabel})</span>
                  <input className="field__input" type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} />
                </label>
              </div>
            </div>
            <div className="panel__preview" aria-label="Preview of the gathering section" role="group">
              <GatheringView
                gathering={previewGathering}
                state={servicePreview}
                personName={memorial.person.displayName}
                now={now}
                headingId={`${base}-gathering-preview`}
              />
            </div>
          </section>
        ) : null}

        <section className="panel" aria-labelledby={`${base}-photos`}>
          <PanelHeading id={`${base}-photos`} title="Photographs on the main memorial">
            Choose the order of the six photographs shown on the main page. The full collection is always in date order.
          </PanelHeading>
          <ol className="order-list">
            {order.map((id, index) => {
              const photo = findPhoto(memorial, id);
              if (!photo) return null;
              return (
                <li key={id} className="order-list__item">
                  <span className="order-list__caption">{photo.caption}</span>
                  <span className="order-list__actions">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move “${photo.caption}” earlier`}
                    >
                      Earlier
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => move(index, 1)}
                      disabled={index === order.length - 1}
                      aria-label={`Move “${photo.caption}” later`}
                    >
                      Later
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="panel" aria-labelledby={`${base}-words`}>
          <PanelHeading id={`${base}-words`} title="Opening words and portrait">
            The introduction beside the portrait, and the point of the portrait that should stay in view when it is cropped.
          </PanelHeading>
          <div className="panel__controls">
            <label className="field">
              <span className="field__label">Introduction</span>
              <textarea
                className="field__input field__textarea"
                rows={3}
                value={intro}
                onChange={(event) => setIntro(event.target.value)}
              />
            </label>
            {portrait ? (
              <div className="focal">
                <div className="focal__frame">
                  <Photo photo={portrait} sizes="16rem" aspect={4 / 5} />
                  <span className="focal__marker" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} aria-hidden="true" />
                </div>
                <div className="focal__controls">
                  <label className="field">
                    <span className="field__label">Across: {focal.x}%</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={focal.x}
                      onChange={(event) => setFocal((current) => ({ ...current, x: Number(event.target.value) }))}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Down: {focal.y}%</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={focal.y}
                      onChange={(event) => setFocal((current) => ({ ...current, y: Number(event.target.value) }))}
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </div>
          <p className="panel__preview opening__lede">{intro}</p>
        </section>

        <section className="panel" aria-labelledby={`${base}-sections`}>
          <PanelHeading id={`${base}-sections`} title="Sections">
            A section that’s switched off disappears completely, with no empty space left behind.
          </PanelHeading>
          <div className="panel__controls">
            <fieldset className="choice">
              <legend className="field__label">Show on the memorial</legend>
              <label className="choice__option">
                <input type="checkbox" checked={gatheringOn} onChange={(event) => setGatheringOn(event.target.checked)} />
                Gathering
              </label>
              <label className="choice__option">
                <input type="checkbox" checked={recipeOn} onChange={(event) => setRecipeOn(event.target.checked)} />
                {memorial.modules.recipe?.heading ?? 'Recipe'}
              </label>
              <label className="choice__option">
                <input type="checkbox" checked={acceptMemories} onChange={(event) => setAcceptMemories(event.target.checked)} />
                Invite visitors to share memories
              </label>
            </fieldset>
            <div className="panel__preview">
              <p className="field__label">Visitors would see, in order:</p>
              <ol className="visible-list">
                {visibleSections.map((section) => (
                  <li key={section}>{section}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="panel" aria-labelledby={`${base}-appearance`}>
          <PanelHeading id={`${base}-appearance`} title="Appearance">
            Three quiet colour schemes on the same layout. Each keeps every piece of text easy to read.
          </PanelHeading>
          <div className="panel__controls">
            <fieldset className="choice">
              <legend className="field__label">Colour scheme</legend>
              {Object.values(PRESETS).map((option) => (
                <label key={option.id} className="choice__option">
                  <input type="radio" name={`${base}-preset`} checked={preset === option.id} onChange={() => setPreset(option.id)} />
                  {option.name}
                  <span className="choice__hint"> {option.description}</span>
                </label>
              ))}
            </fieldset>
            <div className="preset-sample" style={presetStyle}>
              <p className="preset-sample__eyebrow">Remembering</p>
              <p className="preset-sample__name">{memorial.person.shortName ?? memorial.person.fullName}</p>
              <p className="preset-sample__text">{memorial.opening.intro}</p>
              <p className="preset-sample__muted">Captions and dates look like this.</p>
              <p className="preset-sample__warm">Small annotations look like this.</p>
            </div>
          </div>
        </section>

        <section className="panel" aria-labelledby={`${base}-privacy`}>
          <PanelHeading id={`${base}-privacy`} title="Who can see the memorial" />
          <fieldset className="choice">
            <legend className="visually-hidden">Privacy</legend>
            {(Object.keys(PRIVACY_MODES) as PrivacyMode[]).map((option) => (
              <label key={option} className="choice__option choice__option--block">
                <span>
                  <input type="radio" name={`${base}-privacy`} checked={mode === option} onChange={() => setMode(option)} />
                  {PRIVACY_MODES[option].label}
                </span>
                <span className="choice__hint">{PRIVACY_MODES[option].summary}</span>
              </label>
            ))}
          </fieldset>
          <p className={mode === 'private' ? 'notice' : 'notice notice--quiet'} role="status">
            {PRIVACY_MODES[mode].detail}
          </p>
        </section>

        <section className="panel" aria-labelledby={`${base}-export`}>
          <PanelHeading id={`${base}-export`} title="Export">
            Download everything the family has written and arranged for the memorial, as a file you can keep or move elsewhere.
          </PanelHeading>
          <button type="button" className="button" onClick={exportContent}>
            Download the memorial’s content (JSON)
          </button>
        </section>
      </div>
    </div>
  );
}
