import { MetadataRoute } from "next";
import { getAllBlogs } from "@/lib/mdx/blogs";
import { source } from "@/lib/docs/source";
import { getAllHackathons, getPublicProfiles } from "@/db/queries/seo";

export const revalidate = 3600; // Regenerate every hour (FR-019)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Fetch all dynamic content in parallel
  const [hackathons, profiles, blogs, docs] = await Promise.all([
    getAllHackathons(),
    getPublicProfiles(),
    getAllBlogs(),
    Promise.resolve(source.getPages())
  ]);

  // Static pages (FR-015)
  const staticPages = [
    { path: "", priority: 1.0, freq: "monthly" as const },
    { path: "/about", priority: 0.8, freq: "monthly" as const },
    { path: "/contact", priority: 0.7, freq: "monthly" as const },
    { path: "/join-waitlist", priority: 0.7, freq: "monthly" as const },
    { path: "/blog", priority: 0.8, freq: "weekly" as const },
    { path: "/hackathons", priority: 0.9, freq: "daily" as const }
  ].map(({ path, priority, freq }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority
  }));

  // Policy pages (FR-015)
  const policyPages = ["/cookie", "/privacy", "/terms", "/refund"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  // Hackathon pages (FR-016)
  const hackathonPages = hackathons.map((h) => ({
    url: `${baseUrl}/hackathons/${h.slug}`,
    lastModified: h.updated_at ? new Date(h.updated_at) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Profile pages (FR-017)
  const profilePages = profiles.map((p) => ({
    url: `${baseUrl}/${p.url_slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Blog pages (FR-018)
  const blogPages = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.frontmatter.createdDate),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Documentation pages (FR-018)
  const docsPages = docs.map((page) => ({
    url: `${baseUrl}/docs/${page.slugs.join("/")}`,
    lastModified: new Date(page.data.lastModified ?? new Date()),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const allEntries = [
    ...staticPages,
    ...policyPages,
    ...hackathonPages,
    ...profilePages,
    ...blogPages,
    ...docsPages
  ];

  // Check Google's 50K limit (FR-020)
  if (allEntries.length > 50000) {
    console.warn(`Sitemap has ${allEntries.length} URLs, exceeding Google's 50K limit. Consider implementing sitemap index.`);
  }

  return allEntries;
}
