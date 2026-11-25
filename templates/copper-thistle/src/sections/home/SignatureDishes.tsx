import { useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../../app/RestaurantContext';
import { Photo } from '../../components/Photo';
import { Reveal } from '../../components/Reveal';
import { Eyebrow } from '../../components/ui';
import { signatureDishes } from '../../lib/content';

/**
 * A row of signature dishes that scrolls sideways. It can be dragged with a mouse, swiped, scrolled with
 * the keyboard once focused, or moved with the Previous and Next buttons.
 */
export function SignatureDishes() {
  const restaurant = useRestaurant();
  const { signature } = restaurant.home;
  const dishes = signatureDishes(restaurant);
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  if (dishes.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.min(element.clientWidth * 0.8, 720), behavior: 'smooth' });
  };

  // Drag to scroll with a mouse; touch and pens keep their native swipe.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !scroller.current) return;
    drag.current = { x: event.clientX, left: scroller.current.scrollLeft };
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !scroller.current) return;
    scroller.current.scrollLeft = drag.current.left - (event.clientX - drag.current.x) * 1.4;
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <section aria-labelledby="signature-title" className="overflow-hidden bg-cream py-24 md:py-32">
      <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-6">
        <div>
          <Eyebrow>{signature.eyebrow}</Eyebrow>
          <h2 id="signature-title" className="font-display text-4xl italic md:text-5xl">
            {signature.heading}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <p className="hidden max-w-[220px] text-right text-sm text-stone md:block">{signature.note}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/30 hover:border-gold-ink hover:text-gold-ink"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span className="sr-only">Previous dishes</span>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/30 hover:border-gold-ink hover:text-gold-ink"
            >
              <ArrowRight size={18} aria-hidden="true" />
              <span className="sr-only">Next dishes</span>
            </button>
          </div>
        </div>
      </div>

      {/* The scrolling row is a labelled region that takes focus, so keyboard users can scroll it with the arrow keys. */}
      <div
        ref={scroller}
        role="region"
        aria-label={`${signature.heading}, scrollable`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={`no-scrollbar select-none overflow-x-auto pb-4 focus-visible:outline-offset-[-2px] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <ul className="flex w-max gap-8 px-6">
          {dishes.map((dish, index) => (
            <Reveal as="li" key={dish.name} delay={index * 0.05} className="w-[280px] shrink-0 sm:w-[320px]">
              {dish.photo ? (
                <div className="mb-4 h-80 overflow-hidden">
                  <Photo photo={dish.photo} className="pointer-events-none h-full w-full" />
                </div>
              ) : null}
              <h3 className="mb-1 font-display text-xl">{dish.name}</h3>
              <p className="mb-2 text-sm leading-relaxed text-stone">{dish.description}</p>
              <p className="font-medium text-gold-ink">{dish.price}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
