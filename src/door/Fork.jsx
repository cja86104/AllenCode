// @ts-check
import { useDoor } from './DoorProvider.jsx';

/** @type {{ door: import('./doorStorage.js').Door, label: string }[]} */
const DOORS = [
  { door: 'a', label: "I'm building a product or business" },
  { door: 'b', label: 'I want a site for me or my family' },
];

/** The fork: one calm choice between the two doors (spec section 4, step 3). */
export default function Fork() {
  const { door, setDoor } = useDoor();
  return (
    <div role="group" aria-label="What brings you here?" className="flex flex-col gap-4 sm:flex-row">
      {DOORS.map((option) => {
        const chosen = door === option.door;
        return (
          <button
            key={option.door}
            type="button"
            aria-pressed={chosen}
            onClick={() => setDoor(option.door)}
            className={`mono rounded-full border px-6 py-4 text-xs uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember ${
              chosen
                ? 'border-ember bg-ember text-night'
                : 'border-white/20 text-white hover:border-ember hover:text-ember'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
