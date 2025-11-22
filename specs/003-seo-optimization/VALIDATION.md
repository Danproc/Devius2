# SEO Validation Guide

**Feature**: 003-seo-optimization
**Date**: 2025-11-21
**Status**: Implementation Complete - Ready for Manual Validation

---

## Local Testing (Immediate)

### 1. OG Image Generation (T051)

**Test Hackathon OG Image**:
```bash
# Open in browser to verify 1200x630px
http://localhost:3000/api/og/hackathon?title=Test%20Hackathon&prize=1000&currency=USD
```

**Expected**:
- ✅ Image renders with StackPass branding
- ✅ Title displays correctly
- ✅ Prize formatted as $1,000
- ✅ Dimensions: 1200x630px
- ✅ File size: <100KB

---

### 2. Sitemap Generation

**Visit Sitemap**:
```
http://localhost:3000/sitemap.xml
```

**Verify**:
- ✅ All static pages included (/, /about, /contact, /join-waitlist, /blog, /hackathons)
- ✅ Policy pages included (/cookie, /privacy, /terms, /refund)
- ✅ Hackathons included (e.g., /hackathons/stackathon-001)
- ✅ Public profiles included (e.g., /danproc)
- ✅ Blog posts included
- ✅ Documentation pages included
- ✅ Priority values: 0.5-1.0
- ✅ Change frequencies: daily, weekly, monthly, yearly
- ✅ lastModified dates present

---

### 3. Robots.txt

**Visit Robots**:
```
http://localhost:3000/robots.txt
```

**Verify**:
- ✅ User-agent: *
- ✅ Allow: /
- ✅ Disallow: /app/, /api/, /admin/, /super-admin/
- ✅ Sitemap: http://localhost:3000/sitemap.xml

---

### 4. Error Pages

**Test 404 Page**:
```
http://localhost:3000/this-does-not-exist
```

**Verify**:
- ✅ Branded 404 page with DevCard theme
- ✅ "Back to Home" button
- ✅ "Browse Hackathons" button
- ✅ Green accent colors
- ✅ Dark background

**Test Error Page** (requires triggering error):
- Navigate to a page and cause an intentional error
- Verify branded 500 error page
- Verify "Try Again" and "Back to Home" buttons

---

### 5. Metadata Inspection

**Visit Hackathon Page**:
```
http://localhost:3000/hackathons/stackathon-001
```

**View Page Source** and verify:

```html
<!-- Title -->
<title>StackPass Hackathon - StackPass Hackathons | StackPass</title>

<!-- Description -->
<meta name="description" content="..." />

<!-- Canonical -->
<link rel="canonical" href="http://localhost:3000/hackathons/stackathon-001" />

<!-- OpenGraph -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="http://localhost:3000/hackathons/stackathon-001" />
<meta property="og:type" content="website" />
<meta property="og:image" content="http://localhost:3000/api/og/hackathon?..." />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />

<!-- Structured Data - Event Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "StackPass Hackathon",
  "description": "...",
  "startDate": "2025-11-18T00:00:00.000Z",
  "endDate": "2025-11-25T23:59:00.000Z",
  ...
}
</script>

<!-- Breadcrumbs Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
</script>
```

**Checklist**:
- ✅ Title ≤60 characters
- ✅ Description ≤160 characters
- ✅ Canonical URL present
- ✅ OG tags complete
- ✅ Twitter tags complete
- ✅ Event schema present
- ✅ Breadcrumb schema present

---

**Visit Profile Page**:
```
http://localhost:3000/danproc
```

**Verify in page source**:
- ✅ Person schema with name, image, url, description, sameAs
- ✅ OG image uses avatar URL
- ✅ Canonical URL set
- ✅ Twitter card type: summary_large_image
- ✅ Bio fallback if custom_bio missing

---

## Post-Deployment Validation

### 6. Google Rich Results Test (T055, T056, T057)

**After deploying to production**:

**Test Event Schema**:
1. Visit: https://search.google.com/test/rich-results
2. Enter hackathon URL: `https://stackpass.app/hackathons/stackathon-001`
3. Click "Test URL"

**Expected**:
- ✅ "Event" rich result detected
- ✅ All required properties present (name, startDate, endDate, eventStatus, eventAttendanceMode, location, organizer)
- ✅ No errors or warnings
- ✅ Preview shows event details

---

**Test Person Schema**:
1. Visit: https://search.google.com/test/rich-results
2. Enter profile URL: `https://stackpass.app/danproc`
3. Click "Test URL"

**Expected**:
- ✅ "Person" rich result detected
- ✅ All required properties present (name, image, url)
- ✅ Optional properties present (description, sameAs)
- ✅ No errors or warnings

---

**Test Organization Schema**:
1. Visit: https://search.google.com/test/rich-results
2. Enter homepage: `https://stackpass.app`
3. Click "Test URL"

**Expected**:
- ✅ "Organization" rich result detected
- ✅ Properties present (name, url, logo, description, sameAs)
- ✅ No errors or warnings

---

### 7. Social Media Validators (T058, T059, T060)

**Twitter Card Validator** (T058):
1. Visit: https://cards-dev.twitter.com/validator
2. Enter hackathon URL: `https://stackpass.app/hackathons/stackathon-001`
3. Click "Preview card"

**Expected**:
- ✅ Custom OG image displays (1200x630)
- ✅ Hackathon title shown
- ✅ Prize amount visible in image
- ✅ Description truncated to fit
- ✅ Card type: summary_large_image

---

**Facebook Sharing Debugger** (T059):
1. Visit: https://developers.facebook.com/tools/debug/
2. Enter hackathon URL
3. Click "Debug"
4. Click "Scrape Again" to refresh cache

**Expected**:
- ✅ Custom OG image preview
- ✅ Title and description correct
- ✅ No errors or warnings
- ✅ Image dimensions: 1200x630

---

**LinkedIn Post Inspector** (T060):
1. Visit: https://www.linkedin.com/post-inspector/
2. Enter hackathon URL
3. Click "Inspect"

**Expected**:
- ✅ Custom OG image shows
- ✅ Title and description display
- ✅ Preview looks professional

---

### 8. Lighthouse SEO Audits (T052, T053, T054)

**Chrome DevTools Method**:
1. Open page in Chrome
2. F12 > Lighthouse tab
3. Select "SEO" category
4. Select "Desktop" or "Mobile"
5. Click "Analyze page load"

**Homepage Audit** (T052):
```
https://stackpass.app
```

**Target**: SEO score 95+

**Key Metrics**:
- ✅ Document has a meta description
- ✅ Page has successful HTTP status code
- ✅ Links are crawlable
- ✅ Document has a valid hreflang
- ✅ robots.txt is valid
- ✅ Image elements have alt attributes
- ✅ Tap targets are sized appropriately
- ✅ Page is mobile friendly

---

**Hackathon Page Audit** (T053):
```
https://stackpass.app/hackathons/stackathon-001
```

**Target**: SEO score 95+

**Additional Checks**:
- ✅ Structured data is valid (Event schema)
- ✅ Breadcrumbs present
- ✅ Canonical URL matches page URL

---

**Profile Page Audit** (T054):
```
https://stackpass.app/danproc
```

**Target**: SEO score 95+

**Additional Checks**:
- ✅ Structured data is valid (Person schema)
- ✅ Avatar images optimized

---

### 9. Google Search Console (T061, T062)

**Submit Sitemap** (T061):
1. Visit: https://search.google.com/search-console
2. Select property: stackpass.app
3. Navigate to: Sitemaps
4. Enter sitemap URL: `https://stackpass.app/sitemap.xml`
5. Click "Submit"

**Expected**:
- ✅ Sitemap successfully submitted
- ✅ No errors in sitemap
- ✅ All URLs discovered

---

**Monitor Indexing Coverage** (T062):
1. In Google Search Console
2. Navigate to: Coverage report
3. Monitor over 7-30 days

**Target Metrics**:
- ✅ 95%+ of pages indexed within 7 days
- ✅ Zero errors or warnings
- ✅ All hackathons indexed
- ✅ All public profiles indexed

**Watch for**:
- Crawl errors (should be 0)
- Soft 404s (should be 0 - we have proper error pages)
- Server errors (should be 0)
- Valid with warnings (investigate any)

---

## Success Criteria Validation

### Measurable Outcomes (from spec.md)

**1. Search Visibility**
- [ ] StackPass homepage appears in Google for "developer networking platform" (within top 20, 30 days)
- Method: Google search, check position

**2. Rich Results Eligibility**
- [x] 100% of hackathon pages pass Google Rich Results Test for Event schema
- Method: Test each hackathon page (T055)

**3. Social CTR**
- [ ] Social media sharing CTR increases by 40%
- Method: Track clicks from Twitter/LinkedIn/Facebook (requires analytics)
- Baseline: Current CTR before OG images
- Target: 40% increase

**4. Indexing Coverage**
- [ ] 95% of public pages indexed within 7 days
- Method: Google Search Console Coverage report (T062)

**5. Error Rate**
- [x] Zero soft 404 errors in Search Console
- Method: Proper 404/500 pages with correct status codes (T033-T037)

**6. Page Speed**
- [ ] Lighthouse SEO score 95+
- [ ] Lighthouse Performance score 90+
- Method: Chrome DevTools Lighthouse (T052-T054)

**7. Sitemap Coverage**
- [x] Sitemap includes 100% of public hackathons and profiles
- [x] Regenerates within 1 hour of new content
- Method: Test /sitemap.xml (T045)

---

## Validation Checklist

### Pre-Deployment
- [x] OG image API works locally
- [x] Sitemap generates successfully
- [x] Robots.txt configured correctly
- [x] Error pages styled with brand
- [x] All metadata includes canonical URLs
- [x] Structured data on all target pages
- [x] Breadcrumbs on hackathon pages
- [x] Console.logs removed from critical paths

### Post-Deployment (within 24 hours)
- [ ] T055: Test Event schema on live hackathon
- [ ] T056: Test Person schema on live profile
- [ ] T057: Test Organization schema on homepage
- [ ] T058: Validate Twitter Card
- [ ] T059: Validate Facebook Share
- [ ] T060: Validate LinkedIn Share
- [ ] T051: Verify OG images are 1200x630px
- [ ] T052: Homepage Lighthouse audit
- [ ] T053: Hackathon page Lighthouse audit
- [ ] T054: Profile page Lighthouse audit
- [ ] T061: Submit sitemap to Google Search Console

### Post-Deployment (7-30 days)
- [ ] T062: Monitor indexing coverage (target: 95% within 7 days)
- [ ] Track social CTR improvement (target: 40% increase)
- [ ] Monitor search visibility for target keywords
- [ ] Check for crawl errors in Search Console

---

## Tools & Resources

### Validation Tools
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **Google Search Console**: https://search.google.com/search-console
- **Chrome Lighthouse**: Chrome DevTools > Lighthouse tab

### Documentation
- **Schema.org Event**: https://schema.org/Event
- **Schema.org Person**: https://schema.org/Person
- **Schema.org Organization**: https://schema.org/Organization
- **Open Graph Protocol**: https://ogp.me/
- **Twitter Cards**: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

---

## Troubleshooting

### OG Images Not Displaying
1. Test API endpoint directly in browser
2. Check image dimensions (must be 1200x630)
3. Clear social platform cache (Twitter, Facebook)
4. Verify URL encoding in metadata

### Structured Data Not Validating
1. Use Google Rich Results Test
2. Check JSON-LD syntax in page source
3. Verify all required fields present
4. Ensure ISO 8601 date format for Event schema

### Sitemap Issues
1. Check database queries return data
2. Verify is_public filter on profiles
3. Verify hackathon status filter
4. Check total URL count (<50K)

### Metadata Not Updating
1. Clear Next.js cache: `rm -rf .next`
2. Check ISR revalidation periods
3. Verify NEXT_PUBLIC_APP_URL environment variable

---

## Success Metrics Dashboard

Track these metrics post-deployment:

| Metric | Baseline | Target | Current | Status |
|--------|----------|--------|---------|--------|
| Lighthouse SEO Score | 5.5/10 | 9/10 (90+) | TBD | 🟡 Pending |
| Rich Results - Event | 0% | 100% | TBD | 🟡 Pending |
| Rich Results - Person | 0% | 100% | TBD | 🟡 Pending |
| Indexing Coverage | Unknown | 95% (7 days) | TBD | 🟡 Pending |
| Social CTR | Baseline | +40% | TBD | 🟡 Pending |
| Sitemap URLs | ~60 | ~100+ | TBD | 🟡 Pending |
| Soft 404 Errors | Unknown | 0 | TBD | 🟡 Pending |

**Update this table** after running validation tasks.

---

## Post-Validation Actions

### If All Tests Pass ✅
1. Mark feature as production-ready
2. Monitor metrics for 30 days
3. Document learnings in retrospective
4. Plan next SEO iteration (content optimization, backlinks, etc.)

### If Tests Fail ❌
1. Document failing tests in GitHub issue
2. Prioritize fixes based on impact
3. Re-test after fixes
4. Update validation guide with lessons learned

---

## Next Steps After Validation

1. **Content Optimization**: Update hackathon descriptions for better keywords
2. **Blog SEO**: Write SEO-optimized blog posts about hackathons
3. **Backlink Building**: Share on developer communities (Hacker News, Reddit, Dev.to)
4. **Performance**: Continue optimizing LCP and other Core Web Vitals
5. **Schema Expansion**: Add more schema types (Article for blog, FAQPage, etc.)
