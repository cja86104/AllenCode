import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { usePageTitle, useBrewery } from '../app/BreweryContext';
import { HoursList } from '../components/HoursList';
import { Photo } from '../components/Photo';
import { PageHeading } from '../components/ui';
import { mapUrl } from '../lib/content';
import { CanClubSignup } from '../sections/contact/CanClubSignup';
import { ContactForm } from '../sections/contact/ContactForm';

/** The pier office: a message form, where to find the taproom, and when it's open. */
export function ContactPage() {
  const brewery = useBrewery();
  const { contactPage, contact } = brewery;
  usePageTitle('Contact');
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-6 md:pt-20">
        <PageHeading eyebrow={contactPage.eyebrow} title="Contact">
          <p>{contactPage.intro}</p>
        </PageHeading>

        <div className="grid gap-10 lg:grid-cols-2">
          <ContactForm />

          <div className="space-y-6">
            <Photo photo={contactPage.photo} className="clip-card h-64 w-full border border-cream/10" />
            <section aria-labelledby="visit-title" className="grid gap-8 border border-cream/15 p-6 sm:grid-cols-2">
              <h2 id="visit-title" className="sr-only">
                Visit the taproom
              </h2>
              <div className="text-sm">
                <h3 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brass">
                  <MapPin size={14} aria-hidden="true" /> Address
                </h3>
                <address className="not-italic text-mist">
                  {contact.street}
                  <br />
                  {contact.city}
                </address>
                <a
                  href={mapUrl(brewery)}
                  rel="noopener"
                  className="mt-2 inline-flex min-h-[2.75rem] items-center border-b border-brass text-xs uppercase tracking-[0.2em] text-brass"
                >
                  Open in maps
                </a>
                <h3 className="mb-2 mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brass">
                  <Mail size={14} aria-hidden="true" /> Email
                </h3>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex min-h-[2.75rem] items-center break-all text-mist hover:text-brass"
                >
                  {contact.email}
                </a>
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                    className="flex min-h-[2.75rem] items-center gap-2 text-mist hover:text-brass"
                  >
                    <Phone size={14} aria-hidden="true" className="text-brass" /> {contact.phone}
                  </a>
                ) : null}
              </div>
              <div className="text-sm">
                <h3 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brass">
                  <Clock size={14} aria-hidden="true" /> Hours
                </h3>
                <HoursList className="text-mist" />
              </div>
            </section>
          </div>
        </div>
      </div>
      <CanClubSignup />
    </>
  );
}
