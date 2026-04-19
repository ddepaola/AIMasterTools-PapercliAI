import os

BASE = r"C:\Users\domin\.paperclip\instances\default\projects\d99b1703-4ebc-46ca-8ed0-20956e22b386\16046395-a916-4c95-acc9-540e4e245f09\PapercliAI-AIMasterTools\directory"

pages = [
    {
        "id": "coding",
        "label": "Coding",
        "h1": "Best AI Coding Tools 2026",
        "meta_desc": "Compare the 10 best AI coding tools of 2026 -- GitHub Copilot, Cursor, Codeium, Claude Code, and more. Ratings, pricing, and honest reviews.",
        "keywords": "best ai coding tools, ai code assistant, github copilot alternative, cursor ide review, ai pair programmer",
        "intro": "AI coding tools have become indispensable for developers -- from autocomplete that saves keystrokes to autonomous agents that write entire features. Here are the top tools tested by the AIMasterTools team.",
        "faqs": [
            ("Which AI coding tool is best for beginners?", "GitHub Copilot and Replit are both excellent for beginners -- Copilot works inside VS Code with minimal setup, and Replit provides a full browser-based environment with AI agent mode."),
            ("Is there a free AI coding assistant?", "Yes -- Codeium offers a generous free tier with no usage caps. Aider and Continue.dev are fully free and open source."),
            ("What is the best AI for complex multi-file coding tasks?", "Claude Code and Cursor Agent mode are the strongest options for complex, multi-file engineering tasks that require understanding entire codebases."),
        ]
    },
    {
        "id": "image",
        "label": "Image",
        "h1": "Best AI Image Generation Tools 2026",
        "meta_desc": "Compare the 10 best AI image tools of 2026 -- Midjourney, DALL-E 3, Stable Diffusion, Adobe Firefly, and more. Honest ratings and pricing.",
        "keywords": "best ai image generators, midjourney vs dalle, stable diffusion review, ai art tools 2026, free ai image generator",
        "intro": "AI image generation has exploded with quality in 2026. Whether you need photorealistic product shots, artistic illustrations, or free commercial-use images, one of these tools will fit your workflow.",
        "faqs": [
            ("Which AI image generator is best for commercial use?", "Adobe Firefly is specifically trained on licensed content, making it the safest choice for commercial use. Midjourney and DALL-E also allow commercial use under their standard plans."),
            ("Is there a completely free AI image generator?", "Yes -- Bing Image Creator (powered by DALL-E 3) is completely free. Stable Diffusion can also be run locally for free with no usage limits."),
            ("Which AI image tool produces the highest quality results?", "Midjourney consistently produces the most aesthetically impressive results. For photorealism, DALL-E 3 and Adobe Firefly are strong contenders."),
        ]
    },
    {
        "id": "video",
        "label": "Video",
        "h1": "Best AI Video Tools 2026",
        "meta_desc": "Compare the 10 best AI video tools of 2026 -- Runway, HeyGen, Synthesia, Descript, Pika, and more. Ratings, pricing, and honest reviews.",
        "keywords": "best ai video tools, ai video generator, heygen review, runway ml review, synthesia alternative",
        "intro": "AI video tools have reached an inflection point -- you can now generate cinematic clips, translate videos into 40+ languages, and edit footage by editing text. Here are the best tools available today.",
        "faqs": [
            ("Which AI video tool is best for YouTube creators?", "Descript and InVideo AI are the top picks for YouTube -- Descript for editing existing footage, InVideo for converting written content into videos quickly."),
            ("Can AI generate realistic talking-head videos?", "Yes -- HeyGen and Synthesia both produce professional-quality talking-head videos with AI avatars and custom voice cloning."),
            ("What is the best AI tool for video translation?", "HeyGen video translation is currently the best -- it lip-syncs your video into 40+ languages using your cloned voice."),
        ]
    },
    {
        "id": "marketing",
        "label": "Marketing",
        "h1": "Best AI Marketing Tools 2026",
        "meta_desc": "Compare the 10 best AI marketing tools of 2026 -- Semrush, Surfer SEO, HubSpot AI, Ahrefs, AdCreative.ai, and more. Honest ratings and pricing.",
        "keywords": "best ai marketing tools, ai seo tools, surfer seo review, semrush vs ahrefs, ai ad creative tools",
        "intro": "AI has transformed digital marketing -- from SEO research and ad creative generation to email personalization and social scheduling. These are the tools driving the most ROI for marketing teams in 2026.",
        "faqs": [
            ("Which AI marketing tool is best for SEO?", "Semrush and Ahrefs are the two most comprehensive SEO platforms. Surfer SEO is the top pick for content optimization specifically."),
            ("Are there free AI marketing tools?", "HubSpot Marketing free CRM tier, Mailchimp free up to 500 contacts, and Perplexity Pages all offer usable free tiers."),
            ("What AI tool is best for ad creative generation?", "AdCreative.ai is purpose-built for generating conversion-optimized ad images and copy, with AI scoring based on performance data."),
        ]
    },
    {
        "id": "sales",
        "label": "Sales",
        "h1": "Best AI Sales Tools 2026",
        "meta_desc": "Compare the 10 best AI sales tools of 2026 -- Apollo.io, Gong, Clay, Instantly.ai, Lavender, and more. Honest ratings and pricing.",
        "keywords": "best ai sales tools, ai sales prospecting, apollo io review, clay ai review, gong ai review",
        "intro": "AI has automated the most time-consuming parts of the sales process -- prospecting, personalization, call analysis, and follow-up. Here are the tools top-performing sales teams are using in 2026.",
        "faqs": [
            ("What is the best AI tool for cold email outreach?", "Instantly.ai and Smartlead.ai are the top choices for cold email at scale -- both offer unlimited sending accounts and built-in email warmup."),
            ("Which AI tool is best for sales call analysis?", "Gong is the gold standard for conversation intelligence, providing deep analysis of call recordings with deal risk alerts and coaching recommendations."),
            ("Is there a free AI sales tool?", "Apollo.io has a free tier with limited data exports. Lavender also offers a limited free plan for email scoring."),
        ]
    },
    {
        "id": "support",
        "label": "Support",
        "h1": "Best AI Customer Support Tools 2026",
        "meta_desc": "Compare the 10 best AI customer support tools of 2026 -- Intercom Fin, Zendesk AI, Tidio, Chatbase, and more. Honest ratings and pricing.",
        "keywords": "best ai customer support tools, ai chatbot for website, intercom fin review, zendesk ai review, chatbase review",
        "intro": "AI support tools can now resolve 50-70% of customer questions autonomously -- dramatically reducing ticket volume and response times. Here are the best tools for businesses of every size.",
        "faqs": [
            ("Which AI support tool is best for small businesses?", "Tidio is the top choice for small businesses and e-commerce stores -- easy to set up, affordable, and integrates directly with Shopify."),
            ("Can AI handle complex customer support tickets?", "Modern AI agents like Intercom Fin and Forethought can handle surprisingly complex queries using your knowledge base. For truly complex issues, they seamlessly escalate to human agents."),
            ("Is there a free AI chatbot tool?", "Tidio has a free plan, and Chatbase offers a limited free tier for building custom chatbots from your documentation."),
        ]
    },
    {
        "id": "data",
        "label": "Data",
        "h1": "Best AI Data and Analytics Tools 2026",
        "meta_desc": "Compare the 10 best AI data tools of 2026 -- Julius AI, Tableau AI, Hex, DataRobot, and more. Honest ratings, pricing, and features.",
        "keywords": "best ai data tools, ai analytics platform, julius ai review, tableau ai review, no-code machine learning",
        "intro": "AI has made data analysis accessible to everyone -- from natural language queries over your database to automated machine learning and collaborative notebooks. Here are the top data AI tools for 2026.",
        "faqs": [
            ("What is the best AI tool for analyzing spreadsheet data?", "Julius AI and Polymer are the top picks for spreadsheet analysis -- both let you ask questions in plain English and get instant charts and summaries."),
            ("Are there free AI data analysis tools?", "Julius AI, Hex, Deepnote, and Metabase all offer free tiers. Metabase is also fully open source and self-hostable."),
            ("What is AutoML and which tool does it best?", "AutoML automates the machine learning workflow. DataRobot is the enterprise leader; Obviously AI is the easiest no-code option."),
        ]
    },
    {
        "id": "automation",
        "label": "Automation",
        "h1": "Best AI Automation Tools 2026",
        "meta_desc": "Compare the 10 best AI automation tools of 2026 -- Zapier, Make, n8n, Paperclip AI, and more. Honest ratings, pricing, and reviews.",
        "keywords": "best ai automation tools, zapier alternative, n8n review, make integromat review, no-code automation",
        "intro": "AI automation tools let you connect thousands of apps and build multi-step workflows without writing code -- and the latest AI agents can make decisions autonomously. Here are the top platforms for 2026.",
        "faqs": [
            ("What is the best free automation tool?", "n8n and Activepieces are both open source and free to self-host. Zapier and Make also have usable free tiers with limited operations per month."),
            ("What is the difference between Zapier and Make?", "Zapier is easier for beginners with a simpler trigger-action model. Make is more powerful for complex branching workflows but has a steeper learning curve."),
            ("What is an AI agent platform?", "AI agent platforms like Paperclip AI orchestrate multiple AI agents with roles and budgets that autonomously handle business tasks -- beyond simple trigger-action automation."),
        ]
    },
    {
        "id": "productivity",
        "label": "Productivity",
        "h1": "Best AI Productivity Tools 2026",
        "meta_desc": "Compare the 10 best AI productivity tools of 2026 -- Claude, ChatGPT, Notion AI, Perplexity, Reclaim AI, and more. Honest ratings and pricing.",
        "keywords": "best ai productivity tools, ai personal assistant, notion ai review, perplexity ai review, reclaim ai review",
        "intro": "AI productivity tools save professionals hours every week -- from AI scheduling that protects your focus time to AI assistants that answer questions from your own knowledge base. These are the most impactful tools for 2026.",
        "faqs": [
            ("What is the best AI assistant for general productivity?", "Claude and ChatGPT are the two strongest all-purpose AI assistants. Claude excels at long documents and nuanced reasoning; ChatGPT has the broadest range of tools and plugins."),
            ("Are there free AI productivity tools?", "Yes -- Perplexity AI, Elicit, and ChatGPT free tier are all usable without a subscription. Notion AI requires a paid add-on."),
            ("What is the best AI tool for calendar management?", "Reclaim AI and Motion are the top picks -- both automatically schedule tasks and meetings into your calendar and reschedule in real time when priorities shift."),
        ]
    },
]

all_cats = [
    ("writing","Writing"),("coding","Coding"),("image","Image"),("video","Video"),("marketing","Marketing"),
    ("sales","Sales"),("support","Support"),("data","Data"),("automation","Automation"),("productivity","Productivity")
]

def build_page(page):
    cat_links = "\n".join(
        '      <a href="{}.html" class="cat-link{}">{}</a>'.format(
            c[0], " active" if c[0] == page["id"] else "", c[1]
        )
        for c in all_cats
    )
    faqs_html = "\n".join(
        '      <div class="faq-item"><div class="faq-q">{}</div><p class="faq-a">{}</p></div>'.format(q, a)
        for q, a in page["faqs"]
    )

    js_cat = page["id"]
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>""" + page["h1"] + """ | AIMasterTools</title>
  <meta name="description" content=\"""" + page["meta_desc"] + """\" />
  <meta name="keywords" content=\"""" + page["keywords"] + """\" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://aimastertools.com/directory/""" + js_cat + """.html" />
  <link rel="stylesheet" href="../css/styles.css" />
  <style>
    .cat-hero { background: linear-gradient(135deg, var(--bg-secondary) 0%, #0a1628 100%); border-bottom: 1px solid var(--border); padding: 3rem 0 2rem; }
    .breadcrumb { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; }
    .breadcrumb a { color: var(--accent-light); }
    .tools-dir-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .dir-tool-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; transition: all var(--transition); display: flex; flex-direction: column; gap: 0.6rem; position: relative; }
    .dir-tool-card:hover { border-color: var(--accent); background: var(--bg-card-hover); transform: translateY(-2px); box-shadow: var(--shadow-accent); }
    .dir-tool-card.featured { border-color: var(--warning); }
    .featured-badge { position: absolute; top: 0.75rem; right: 0.75rem; background: var(--warning); color: #000; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 2rem; }
    .dir-tool-name { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
    .dir-tool-tagline { font-size: 0.8rem; color: var(--text-muted); }
    .dir-tool-desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; flex: 1; }
    .dir-tool-features { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .feature-tag { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.15rem 0.5rem; font-size: 0.72rem; color: var(--text-muted); }
    .dir-tool-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--border); }
    .dir-tool-price { font-size: 0.85rem; color: var(--text-secondary); }
    .dir-tool-meta { display: flex; align-items: center; gap: 0.75rem; }
    .rating-num { font-size: 0.9rem; font-weight: 700; color: var(--warning); }
    .rating-star { color: var(--warning); font-size: 0.8rem; }
    .pricing-badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 2rem; font-weight: 600; }
    .pricing-free { background: rgba(16,185,129,0.15); color: #10b981; }
    .pricing-freemium { background: rgba(37,99,235,0.15); color: #3b82f6; }
    .pricing-paid { background: rgba(245,158,11,0.12); color: #f59e0b; }
    .pricing-enterprise { background: rgba(239,68,68,0.12); color: #ef4444; }
    .dir-visit-btn { background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); padding: 0.4rem 0.9rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: none; transition: background var(--transition); }
    .dir-visit-btn:hover { background: var(--accent-light); color: #fff; }
    .faq-section { margin: 3rem 0; }
    .faq-section h2 { margin-bottom: 1.5rem; }
    .faq-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; margin-bottom: 0.75rem; }
    .faq-q { font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    .faq-a { color: var(--text-secondary); font-size: 0.9rem; margin: 0; }
    .cat-nav-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 2rem 0; }
    .cat-link { background: var(--bg-card); border: 1px solid var(--border); border-radius: 2rem; padding: 0.4rem 0.9rem; color: var(--text-secondary); font-size: 0.85rem; text-decoration: none; transition: all var(--transition); }
    .cat-link:hover { background: var(--accent); border-color: var(--accent); color: #fff; }
    .cat-link.active { background: var(--accent); border-color: var(--accent); color: #fff; }
    @media (max-width: 640px) { .tools-dir-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
<header class="site-header">
  <div class="container">
    <nav class="nav-inner">
      <a href="../index.html" class="nav-logo">AI<span>Master</span>Tools</a>
      <ul class="nav-links" id="navLinks">
        <li><a href="../index.html">Home</a></li>
        <li><a href="../directory.html" class="active">Directory</a></li>
        <li><a href="../compare.html">Compare</a></li>
        <li><a href="../reviews/claude.html">Claude</a></li>
        <li><a href="../reviews/chatgpt.html">ChatGPT</a></li>
        <li><a href="../ai-prompt-library.html">Prompt Library</a></li>
        <li><a href="../index.html#signup" class="nav-signup btn">Newsletter</a></li>
      </ul>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation"><span></span><span></span><span></span></button>
    </nav>
  </div>
</header>
<main>
  <div class="cat-hero">
    <div class="container">
      <div class="breadcrumb">
        <a href="../index.html">Home</a> &rsaquo;
        <a href="../directory.html">AI Directory</a> &rsaquo;
        """ + page["label"] + """ Tools
      </div>
      <h1>""" + page["h1"] + """</h1>
      <p style="max-width:640px;font-size:1.1rem;">""" + page["intro"] + """</p>
    </div>
  </div>
  <div class="container" style="padding-top:2rem;">
    <div class="cat-nav-row">
""" + cat_links + """
    </div>
    <div class="tools-dir-grid" id="toolGrid"></div>
    <div class="faq-section">
      <h2>Frequently Asked Questions</h2>
""" + faqs_html + """
    </div>
    <div style="text-align:center;margin:2rem 0;">
      <a href="../directory.html" class="btn btn-secondary">Browse All 100 AI Tools</a>
      <a href="../directory.html#submit-tool" class="btn btn-primary" style="margin-left:0.75rem;">Submit Your Tool</a>
    </div>
  </div>
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-bottom">
      <p>2026 AIMasterTools | <a href="../affiliate-disclosure.html">Affiliate Disclosure</a> | <a href="../privacy-policy.html">Privacy</a></p>
    </div>
  </div>
</footer>
<script src="../products/directory/tools.js"></script>
<script>
  function pricingClass(t) { return {free:'pricing-free',freemium:'pricing-freemium',paid:'pricing-paid',enterprise:'pricing-enterprise'}[t]||'pricing-paid'; }
  function pricingLabel(t) { return {free:'Free',freemium:'Freemium',paid:'Paid',enterprise:'Enterprise'}[t]||'Paid'; }
  function stars(r) { var s=''; for(var i=0;i<5;i++) s+=(i<Math.floor(r/2)?'\\u2605':'\\u2606'); return s; }
  var tools = AI_TOOLS.filter(function(t) { return t.category === '""" + js_cat + """'; });
  var grid = document.getElementById('toolGrid');
  tools.forEach(function(tool) {
    var card=document.createElement('div'); card.className='dir-tool-card'+(tool.featured?' featured':'');
    if(tool.featured){var b=document.createElement('span');b.className='featured-badge';b.textContent='Featured';card.appendChild(b);}
    var n=document.createElement('div');n.className='dir-tool-name';n.textContent=tool.name;card.appendChild(n);
    var tg=document.createElement('div');tg.className='dir-tool-tagline';tg.textContent=tool.tagline;card.appendChild(tg);
    var d=document.createElement('div');d.className='dir-tool-desc';d.textContent=tool.description;card.appendChild(d);
    var fw=document.createElement('div');fw.className='dir-tool-features';
    (tool.features||[]).slice(0,4).forEach(function(f){var tag=document.createElement('span');tag.className='feature-tag';tag.textContent=f;fw.appendChild(tag);});
    card.appendChild(fw);
    var footer=document.createElement('div');footer.className='dir-tool-footer';
    var mw=document.createElement('div');var mr=document.createElement('div');mr.className='dir-tool-meta';
    var rw=document.createElement('div');rw.className='dir-tool-rating';
    var se=document.createElement('span');se.className='rating-star';se.textContent=stars(tool.rating);rw.appendChild(se);
    var ne=document.createElement('span');ne.className='rating-num';ne.textContent=tool.rating;rw.appendChild(ne);
    mr.appendChild(rw);
    var pb=document.createElement('span');pb.className='pricing-badge '+pricingClass(tool.pricingTier);pb.textContent=pricingLabel(tool.pricingTier);mr.appendChild(pb);
    mw.appendChild(mr);
    var pe=document.createElement('div');pe.className='dir-tool-price';pe.style.marginTop='0.25rem';pe.textContent=tool.pricing;mw.appendChild(pe);
    footer.appendChild(mw);
    var vb=document.createElement('a');vb.className='dir-visit-btn';vb.textContent='Visit';vb.href=tool.url;vb.target='_blank';vb.rel='noopener noreferrer';footer.appendChild(vb);
    card.appendChild(footer);grid.appendChild(card);
  });
  document.getElementById('navToggle').addEventListener('click',function(){document.getElementById('navLinks').classList.toggle('open');});
</script>
</body>
</html>"""

for page in pages:
    html = build_page(page)
    out = os.path.join(BASE, page["id"] + ".html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("Created:", page["id"] + ".html")

print("All done.")
