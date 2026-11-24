import { useMemorial } from '../app/MemorialContext';
import { PhotoFigure } from '../components/PhotoFigure';
import { findPhoto } from '../lib/content';
import { SECTION_IDS } from '../lib/navigation';

/**
 * A favourite recipe: the card as it was written beside a typed transcription anyone can read, copy or
 * print. When the family supplies a scan of the card it is shown; otherwise the card's own lines are
 * typeset on a ruled card so the wording, crossings-out and all, is still real text.
 */
export function Recipe() {
  const memorial = useMemorial();
  const recipe = memorial.modules.recipe;
  if (!recipe?.enabled) return null;
  const scan = findPhoto(memorial, recipe.cardPhotoId);

  return (
    <section id={SECTION_IDS.recipe} className="section recipe" aria-labelledby="recipe-heading">
      <header className="section-head section-head--narrow">
        <p className="section-head__kicker">{recipe.heading}</p>
        <h2 id="recipe-heading" className="section-head__title">
          {recipe.name}
        </h2>
        {recipe.provenance ? <p className="section-head__intro">{recipe.provenance}</p> : null}
      </header>

      <div className="recipe__spread">
        {scan ? (
          <PhotoFigure className="recipe__scan" photo={scan} sizes="(min-width: 64em) 40vw, 92vw" />
        ) : recipe.cardLines.length > 0 ? (
          <figure className="recipe__card-figure">
            <div className="recipe-card" lang="en">
              {recipe.cardLines.map((line, index) => (
                <p key={`${index}-${line}`} className={index === 0 ? 'recipe-card__title' : 'recipe-card__line'}>
                  {line}
                </p>
              ))}
            </div>
            <figcaption className="plate__caption">
              <span className="plate__text">The card, as written.</span>
            </figcaption>
          </figure>
        ) : null}

        <div className="recipe__transcription">
          <h3 className="recipe__subhead">Ingredients</h3>
          <ul className="recipe__ingredients">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
          <h3 className="recipe__subhead">Method</h3>
          <ol className="recipe__steps">
            {recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {recipe.notes && recipe.notes.length > 0 ? (
            <div className="recipe__notes">
              {recipe.notes.map((note) => (
                <p key={note} className="annotation">
                  {note}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
