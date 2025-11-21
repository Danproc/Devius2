/**
 * StructuredData component for rendering JSON-LD structured data
 * Used for Schema.org markup (Organization, Event, Person, BreadcrumbList)
 */
export function StructuredData({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
