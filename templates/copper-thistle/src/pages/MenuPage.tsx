import { useId, useState, type KeyboardEvent } from 'react';
import { Fish, Flame, Leaf, Wheat, type LucideIcon } from 'lucide-react';
import { usePageTitle, useRestaurant } from '../app/RestaurantContext';
import { PageHeading } from '../components/ui';
import type { DietaryTag, MenuItem } from '../content/types';

export const DIETARY: Record<DietaryTag, { icon: LucideIcon; label: string }> = {
  vegetarian: { icon: Leaf, label: 'Vegetarian' },
  spicy: { icon: Flame, label: 'Spicy' },
  seafood: { icon: Fish, label: 'Seafood' },
  gluten: { icon: Wheat, label: 'Contains gluten' },
};

function Item({ item }: { item: MenuItem }) {
  return (
    <li className="flex items-start justify-between gap-4 border-b border-charcoal/15 py-5">
      <div>
        <h3 className="inline-flex flex-wrap items-center gap-2 font-display text-lg">
          {item.name}
          {item.tags.length > 0 ? (
            <span className="inline-flex gap-1 text-burgundy">
              {item.tags.map((tag) => {
                const { icon: Icon, label } = DIETARY[tag];
                return (
                  <span key={tag} title={label}>
                    <Icon size={14} aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                  </span>
                );
              })}
            </span>
          ) : null}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-stone">{item.description}</p>
      </div>
      <p className="mt-1 whitespace-nowrap text-right font-medium text-gold-ink">{item.price}</p>
    </li>
  );
}

/**
 * The menu, one category at a time behind accessible tabs (arrow keys, Home and End move between them).
 * Without JavaScript, and when printed, every category is shown in full, one after another.
 */
export function MenuPage() {
  const restaurant = useRestaurant();
  const { menu } = restaurant;
  usePageTitle('Menu');
  const [active, setActive] = useState(menu.categories[0]?.id ?? '');
  const base = useId();
  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = (id: string) => `${base}-panel-${id}`;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = menu.categories.length - 1;
    const target =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1;
    if (target < 0) return;
    event.preventDefault();
    const category = menu.categories[target];
    if (!category) return;
    setActive(category.id);
    document.getElementById(tabId(category.id))?.focus();
  };

  return (
    <div className="bg-cream pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-6xl px-6">
        <PageHeading eyebrow={menu.eyebrow} title={menu.heading} />

        <div
          role="tablist"
          aria-label="Menu sections"
          className="menu-tabs no-print no-scrollbar mb-12 flex gap-6 overflow-x-auto border-b border-charcoal/15 md:gap-10"
        >
          {menu.categories.map((category, index) => {
            const selected = category.id === active;
            return (
              <button
                key={category.id}
                id={tabId(category.id)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId(category.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(category.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={`min-h-[2.75rem] whitespace-nowrap border-b-2 pb-3 text-sm uppercase tracking-[0.15em] transition-colors duration-300 motion-reduce:transition-none md:text-base ${
                  selected ? 'border-gold font-medium text-burgundy' : 'border-transparent text-stone hover:text-burgundy'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {menu.categories.map((category) => (
          <section
            key={category.id}
            id={panelId(category.id)}
            role="tabpanel"
            aria-labelledby={tabId(category.id)}
            data-active={category.id === active}
            className="menu-panel"
          >
            <h2 className="menu-panel__title mb-2 mt-10 font-display text-3xl italic">{category.label}</h2>
            <ul className="grid gap-x-16 md:grid-cols-2">
              {category.items.map((item) => (
                <Item key={item.name} item={item} />
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-charcoal/15 pt-8 text-xs text-stone">
          <ul className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Key">
            {Object.values(DIETARY).map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={14} aria-hidden="true" /> {label}
              </li>
            ))}
          </ul>
          <div className="space-y-1 md:ml-auto md:text-right">
            {menu.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
