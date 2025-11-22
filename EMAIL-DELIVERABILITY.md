# Email Deliverability Guide for StackPass

## 🚨 Current Issue: Emails Landing in Spam

This document explains how to improve email deliverability and prevent emails from landing in spam folders.

---

## 📧 Quick Wins (Do These First)

### 1. **Verify Your Domain with Resend**

**Steps**:
1. Log into your Resend dashboard: https://resend.com/domains
2. Add your domain: `stackpass.dev`
3. Add the DNS records Resend provides:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)

**Why**: Email providers (Gmail, Outlook) check these records to verify you actually own the domain and are authorized to send from it.

### 2. **Use a Subdomain for Transactional Emails**

**Recommendation**: Send from `noreply@mail.stackpass.dev` instead of `noreply@stackpass.dev`

**Why**:
- Protects your main domain reputation
- Separates marketing vs transactional email
- Industry best practice

**How to Set Up**:
1. In Resend dashboard, add domain: `mail.stackpass.dev`
2. Add DNS records for subdomain
3. Update `.env`:
   ```
   RESEND_FROM_EMAIL="noreply@mail.stackpass.dev"
   ```

### 3. **Warm Up Your Domain**

**Problem**: New domains sending high volumes = spam flags

**Solution**: Gradually increase send volume
- Week 1: Send to 50-100 emails/day
- Week 2: Send to 200-500 emails/day
- Week 3: Send to 1,000+ emails/day
- Week 4+: Full volume

**Tip**: Start by sending to engaged users only (recent signups, active users)

---

## 🔧 Technical DNS Setup

### Required DNS Records

Add these to your DNS provider (Vercel, Cloudflare, etc.):

#### **SPF Record** (Sender Policy Framework)
```
Type: TXT
Name: @ (or mail if using subdomain)
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

**What it does**: Tells email providers that Resend is authorized to send emails on your behalf.

#### **DKIM Record** (DomainKeys Identified Mail)
```
Type: TXT
Name: resend._domainkey (provided by Resend)
Value: [Long string provided by Resend]
TTL: 3600
```

**What it does**: Cryptographically signs your emails to prove they haven't been tampered with.

#### **DMARC Record** (Domain-based Message Authentication)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dan@stackpass.dev; pct=100; adkim=s; aspf=s
TTL: 3600
```

**What it does**: Tells email providers what to do if SPF/DKIM checks fail.

**DMARC Policy Options**:
- `p=none` - Monitor only (start here)
- `p=quarantine` - Send to spam if fail (intermediate)
- `p=reject` - Block entirely if fail (after testing)

---

## 📝 Content Best Practices

### Avoid Spam Triggers

**❌ Don't Use**:
- ALL CAPS IN SUBJECT LINES
- Excessive exclamation marks!!!
- Spammy words: "FREE", "LIMITED TIME", "ACT NOW", "CLICK HERE"
- Red/large text in HTML
- Too many links (> 5)
- Image-heavy emails with little text
- Shortened URLs (bit.ly, etc)

**✅ Do Use**:
- Clear, descriptive subject lines
- Personalization: "Hi {name}"
- Plain text version alongside HTML
- Proper HTML structure
- Unsubscribe link (legally required in some regions)
- Physical address in footer

### Current Email Template Review

**Good**:
- ✅ Personalized greetings
- ✅ Clear call-to-action buttons
- ✅ Proper HTML structure with Layout component
- ✅ StackPass branding

**To Improve**:
- ⚠️ Add unsubscribe link to all templates
- ⚠️ Add physical address to footer (required for CAN-SPAM compliance)
- ⚠️ Consider adding plain text versions

---

## 🛠️ Resend Configuration

### Enable Additional Features

**In Resend Dashboard**:

1. **Domain Verification**: Verify your domain is showing green checkmarks for SPF and DKIM

2. **Webhooks**: Set up webhooks to track:
   - Bounces (bad email addresses)
   - Complaints (users marking as spam)
   - Opens (engagement tracking)
   - Clicks (link tracking)

3. **Suppression List**: Automatically maintained by Resend
   - Bounced emails
   - Unsubscribes
   - Complaints

4. **DKIM Signing**: Should be enabled by default after domain verification

---

## 📊 Monitor Email Health

### Key Metrics to Track

**In Resend Dashboard**:
- **Delivery Rate**: Should be > 95%
- **Open Rate**: Benchmark 15-25% for transactional emails
- **Bounce Rate**: Should be < 5%
- **Complaint Rate**: Should be < 0.1%

**Warning Signs**:
- 🚨 Delivery rate < 90% - Check DNS records
- 🚨 Bounce rate > 10% - Clean email list
- 🚨 Complaint rate > 0.5% - Review email content

### Set Up Alerts

In Resend:
- Alert if bounce rate > 5%
- Alert if complaint rate > 0.1%
- Alert if delivery rate drops

---

## ✉️ Email Content Improvements

### Add Unsubscribe Link

Update Layout component to include unsubscribe:

```tsx
// In src/emails/components/Layout.tsx
<Text className="text-xs text-gray-400">
  Don't want these emails?
  <Link href={`${baseUrl}/app/settings/notifications`}>
    Unsubscribe
  </Link>
</Text>
```

### Add Physical Address (CAN-SPAM Compliance)

```tsx
<Text className="text-xs text-gray-400">
  StackPass
  <br />
  [Your Business Address]
  <br />
  [City, State, ZIP]
</Text>
```

### Add Plain Text Versions

Resend automatically generates plain text, but you can optimize:

```typescript
await resend.emails.send({
  from: getFromEmail(),
  to: user.email,
  subject: 'Welcome!',
  react: WelcomeEmail({ ... }),
  // Optional: Add custom plain text
  text: 'Welcome to StackPass! Visit https://stackpass.dev to get started.',
});
```

---

## 🔍 Spam Testing Tools

### Test Before Sending

**Mail-Tester.com**:
1. Send test email to address provided by mail-tester.com
2. Get spam score out of 10
3. Fix issues identified
4. Goal: Score 8/10 or higher

**GlockApps** (Paid):
- Tests how your emails appear in Gmail, Outlook, Yahoo, etc.
- Shows inbox vs spam placement

**Litmus** (Paid):
- Email preview across 90+ email clients
- Spam testing

---

## ⚙️ Implementation Checklist

### Immediate Actions (Do Today)

- [ ] Add domain to Resend dashboard
- [ ] Add SPF record to DNS
- [ ] Add DKIM record to DNS
- [ ] Add DMARC record (start with p=none)
- [ ] Verify domain in Resend (wait for green checkmarks)
- [ ] Update RESEND_FROM_EMAIL to use verified domain

### Short Term (This Week)

- [ ] Send test emails and check spam folder
- [ ] Use mail-tester.com to check spam score
- [ ] Add unsubscribe link to email templates
- [ ] Add physical address to email footer
- [ ] Set up Resend webhooks for bounce/complaint tracking
- [ ] Implement warm-up schedule (start with 50-100 emails/day)

### Long Term (This Month)

- [ ] Monitor deliverability metrics in Resend
- [ ] Clean email list (remove bounces)
- [ ] Implement email preferences in user settings
- [ ] Add re-engagement campaign for inactive users
- [ ] Gradually increase DMARC policy (none → quarantine → reject)

---

## 🎯 Expected Results

**After DNS Setup** (24-48 hours):
- Emails should land in inbox, not spam
- Gmail/Outlook will show authenticated sender
- Deliverability rate should be > 95%

**After Warm-Up** (2-4 weeks):
- Excellent sender reputation established
- Consistent inbox placement
- Higher open rates

---

## 🆘 Troubleshooting

### "My emails still go to spam after DNS setup"

**Check**:
1. DNS propagation (can take 24-48 hours) - Use https://dnschecker.org
2. Verify all 3 records are correct (SPF, DKIM, DMARC)
3. Check Resend dashboard shows green verification
4. Test with mail-tester.com to see specific issues
5. Check email content for spam triggers

### "Gmail says: 'This message was not authenticated'"

**Fix**: DKIM not set up correctly
- Verify DKIM record in DNS
- Check Resend domain verification status
- Wait 24-48 hours for DNS propagation

### "High bounce rate"

**Fix**: Clean your email list
- Remove obviously fake emails (test@test.com)
- Remove bounced addresses
- Validate email format before sending

---

## 📚 Resources

- **Resend Docs**: https://resend.com/docs
- **SPF Setup**: https://resend.com/docs/dashboard/domains/spf
- **DKIM Setup**: https://resend.com/docs/dashboard/domains/dkim
- **DMARC Guide**: https://resend.com/docs/dashboard/domains/dmarc
- **CAN-SPAM Compliance**: https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business

---

## 🎯 Summary

**Root Causes of Spam**:
1. ❌ Missing DNS records (SPF, DKIM, DMARC)
2. ❌ Unverified domain
3. ❌ New domain with no sending history
4. ❌ Spammy content
5. ❌ High volume from cold start

**Solutions Applied**:
1. ✅ Fixed hardcoded URLs in emails
2. ✅ Email system now working (was broken)
3. 📋 DNS setup guide provided
4. 📋 Warm-up schedule provided
5. 📋 Content guidelines provided

**Next Step**: Add those DNS records! That's the #1 fix for spam issues.
