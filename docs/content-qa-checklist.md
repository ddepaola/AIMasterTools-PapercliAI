# Content QA Checklist — AIMasterTools

**Mandatory before publishing any content to Reddit, Twitter/X, email, or the website.**

---

## Date & Year QA (Critical — board-mandated)

The board has explicitly required that all content use the **current year (2026)**. Never publish content with a stale year. This burned us on a Reddit post that said "2025" in April 2026 and cannot be edited.

### Automated check (required)

Run before every commit that touches content or HTML:

```bash
python3 scripts/date-qa-check.py
```

- Exit 0 = clean, safe to proceed
- Exit 1 = violations found — fix before publishing

To auto-fix all occurrences:

```bash
python3 scripts/date-qa-check.py --fix
```

To check a specific file:

```bash
python3 scripts/date-qa-check.py content/emails/email-2-make-money.html
```

### Manual checklist

Before any content is published, verify:

- [ ] No bare "2025" (or earlier year) in title, subtitle, or subject line
- [ ] No bare "2025" in body paragraphs, headings, or CTAs
- [ ] Copyright footers read "2026 AIMasterTools"
- [ ] Meta titles and descriptions use "2026" where a year appears
- [ ] Email subject lines use the correct year
- [ ] Social posts (Twitter/X, Reddit) use "2026" — **Reddit post titles cannot be edited after posting**

---

## Content Pipeline — Pre-Publish Steps

All content agents must complete these steps before marking a content task done:

1. **Run date QA check** (`python3 scripts/date-qa-check.py`) — must exit 0
2. **Spell check** title, headings, and first paragraph
3. **Link check** — all URLs resolve and are not broken
4. **Affiliate disclosure** — confirm affiliate links are disclosed per `affiliate-disclosure.html`
5. **CTA check** — every piece of content has one clear call-to-action
6. **Cross-post record** — log where the content was published in the relevant content tracking file

---

## Reddit-Specific Rules

Reddit post **titles cannot be edited** after publishing. Errors in titles are permanent.

Before submitting any Reddit post:

- [ ] Read the title aloud — does it sound current and accurate?
- [ ] Check the title for year references — must say 2026 if a year appears
- [ ] Check the body for year references — run date-qa-check.py on the draft
- [ ] Verify the subreddit rules allow self-promotion (check before posting, not after)
- [ ] Do not repost within 7 days to the same subreddit

---

## Twitter/X-Specific Rules

- [ ] Posts referencing a year must say 2026
- [ ] Do not schedule tweets more than 2 weeks out without re-checking for date accuracy
- [ ] Thread openers must be engaging and year-accurate — they cannot be deleted without deleting the whole thread

---

## Email-Specific Rules

- [ ] Subject line must not reference a stale year
- [ ] Body content year references must be 2026
- [ ] Send a test to yourself before broadcast

---

## Incident History

| Date | Issue | Root Cause | Fix |
|------|-------|------------|-----|
| 2026-04 | Reddit post "Top 5 Free AI Tools" subtitle said "2025" | No year QA before publish; title cannot be edited | Board-mandated date QA check added; 90 occurrences fixed across 17 files (commit 6e5f736) |

---

*This checklist is mandatory. Violations should be flagged to the CMO before publishing.*
