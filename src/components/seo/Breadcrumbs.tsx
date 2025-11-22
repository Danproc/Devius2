import Link from 'next/link';
import { StructuredData } from './StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Breadcrumbs component with Schema.org structured data
 * Renders visual breadcrumb navigation and BreadcrumbList JSON-LD
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = generateBreadcrumbSchema(items);

  return (
    <>
      <StructuredData schema={schema} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex gap-2 text-sm text-devcard-text">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-2">
              {i < items.length - 1 ? (
                <>
                  <Link
                    href={item.href}
                    className="hover:text-devcard-green transition-colors"
                  >
                    {item.label}
                  </Link>
                  <span>/</span>
                </>
              ) : (
                <span className="text-devcard-heading">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
