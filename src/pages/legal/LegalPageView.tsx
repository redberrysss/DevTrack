import { usePageMeta } from '@/hooks/usePageMeta';
import { siteConfig } from '@/config/site';
import { Card } from '@/components/ui/Card';
import { InlineNotice } from '@/components/ui/States';

const lastUpdated = 'Last updated: 27 September 2026';

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalPageViewProps {
  title: string;
  metaDescription: string;
  intro: string;
  sections: LegalSection[];
  contact: LegalSection;
}

export function LegalPageView({ title, metaDescription, intro, sections, contact }: LegalPageViewProps) {
  usePageMeta({ title: `${title} — DevTrack`, description: metaDescription });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-subtle">{lastUpdated}</p>
      <p className="mt-5 text-ink-muted">{intro}</p>

      {siteConfig.githubUrl ? null : (
        <InlineNotice tone="caution" className="mt-6">
          <span className="block">
            <strong className="font-semibold">Deployment notice.</strong> No project contact address is configured for
            this deployment. Set <code className="text-xs">VITE_SITE_GITHUB_URL</code> in{' '}
            <code className="text-xs">.env.local</code> so the contact section below points somewhere real.
          </span>
        </InlineNotice>
      )}

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <Card key={section.id}>
            <section id={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`} className="text-lg font-semibold tracking-tight text-ink">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-ink-muted">
                    {paragraph}
                  </p>
                ))}
                {section.list ? (
                  <ul className="space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm text-ink-muted">
                        <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-ink-subtle" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          </Card>
        ))}

        <Card>
          <section id={contact.id} aria-labelledby={`${contact.id}-heading`}>
            <h2 id={`${contact.id}-heading`} className="text-lg font-semibold tracking-tight text-ink">
              {contact.heading}
            </h2>
            <div className="mt-3 space-y-3">
              {contact.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>
            {siteConfig.githubUrl ? (
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline break-anywhere"
              >
                {siteConfig.githubUrl.replace(/^https?:\/\//, '')}
              </a>
            ) : null}
          </section>
        </Card>
      </div>
    </div>
  );
}
