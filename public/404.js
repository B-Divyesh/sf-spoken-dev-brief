const canonical = document.querySelector('link[rel="canonical"]');
if (canonical && location.origin === 'https://spoken-dev-brief.sociobot.in') canonical.href = location.href;
