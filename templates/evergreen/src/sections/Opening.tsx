import { useMemorial, useNow, useServicePreview } from '../app/MemorialContext';
import { PhotoDetails } from '../components/PhotoFigure';
import { Photo } from '../components/Photo';
import { findPhoto } from '../lib/content';
import { formatLifeDate, partialDateTimeValue } from '../lib/dates';
import { SECTION_IDS } from '../lib/navigation';
import { serviceState } from '../lib/service';

/**
 * The first spread: "Remembering", the name, the dates and place, a candid portrait to one side, and a
 * short introduction with one quiet action. Without a portrait the spread closes up around the name.
 */
export function Opening() {
  const memorial = useMemorial();
  const now = useNow();
  const preview = useServicePreview();
  const { person, opening } = memorial;
  const portrait = findPhoto(memorial, opening.portraitId);
  const lines = person.nameLines && person.nameLines.length > 0 ? person.nameLines : [person.fullName];
  const born = person.showDates ? formatLifeDate(person.born) : '';
  const died = person.showDates ? formatLifeDate(person.died) : '';
  const state = preview ?? serviceState(memorial.gathering, now);

  return (
    <section className={portrait ? 'opening' : 'opening opening--no-portrait'} aria-labelledby="opening-name">
      <div className="opening__title">
        <p className="opening__eyebrow">{opening.eyebrow}</p>
        <h1 id="opening-name" className="opening__name">
          {lines.map((line, index) => (
            <span key={line} className="opening__line">
              {index > 0 ? ' ' : ''}
              {line}
            </span>
          ))}
        </h1>
        {born || died ? (
          <p className="opening__dates">
            {born ? <time dateTime={partialDateTimeValue(person.born)}>{born}</time> : null}
            {born && died ? <span aria-hidden="true"> — </span> : null}
            {born && died ? <span className="visually-hidden"> to </span> : null}
            {died ? <time dateTime={partialDateTimeValue(person.died)}>{died}</time> : null}
          </p>
        ) : null}
        {person.place ? <p className="opening__place">{person.place}</p> : null}
      </div>

      {portrait ? (
        <figure className="opening__portrait">
          <div className="opening__frame">
            <Photo photo={portrait} priority sizes="(min-width: 64em) 46vw, 92vw" aspect={4 / 5} />
          </div>
          <figcaption className="plate__caption">
            <span className="plate__text">{portrait.caption}</span>
            <PhotoDetails photo={portrait} />
          </figcaption>
        </figure>
      ) : null}

      <div className="opening__intro">
        <p className="opening__lede">{opening.intro}</p>
        <p className="opening__actions">
          <a className="button" href={`#${SECTION_IDS.life}`}>
            Explore {person.pronouns.possessive} life
          </a>
          {state === 'upcoming' ? (
            <a className="text-link" href={`#${SECTION_IDS.gathering}`}>
              Service details
            </a>
          ) : null}
        </p>
      </div>
    </section>
  );
}
