const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const stylesPath = path.join(root, "styles.css");
const scriptPath = path.join(root, "script.js");
const distDir = path.join(root, "dist");
const outputPath = path.join(distDir, "index.html");
const headersPath = path.join(distDir, "_headers");
const redirectsPath = path.join(distDir, "_redirects");
const sitemapPath = path.join(distDir, "sitemap.xml");
const robotsPath = path.join(distDir, "robots.txt");
const notFoundPath = path.join(distDir, "404.html");
const faviconPath = path.join(root, "favicon.svg");
const distFaviconPath = path.join(distDir, "favicon.svg");
const faviconPngPath = path.join(root, "favicon-96x96.png");
const distFaviconPngPath = path.join(distDir, "favicon-96x96.png");
const ogImagePath = path.join(root, "og-image.svg");
const distOgImagePath = path.join(distDir, "og-image.svg");
const ogImagePngPath = path.join(root, "og-image.png");
const distOgImagePngPath = path.join(distDir, "og-image.png");
const quizIconAssetsPath = path.join(root, "assets", "Quiz-icon", "processed");
const distQuizIconAssetsPath = path.join(distDir, "assets", "Quiz-icon", "processed");
const siteUrl = "https://blue-archive-quiz.pages.dev/";
const fallbackPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);
const officialLinks = [
  ["公式サイト", "https://bluearchive.jp/"],
  [
    "App Store",
    "https://apps.apple.com/jp/app/%E3%83%96%E3%83%AB%E3%83%BC%E3%82%A2%E3%83%BC%E3%82%AB%E3%82%A4%E3%83%96/id1515877221",
  ],
  ["Google Play", "https://play.google.com/store/apps/details?hl=ja&id=com.YostarJP.BlueArchive"],
];
const buildDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const genreThumbnails = {
  "生徒シルエット": "assets/Quiz-icon/processed/ジャンル別画像/シルエット.png",
  "生徒の名前": "assets/Quiz-icon/processed/ジャンル別画像/生徒の名前.png",
  "ガチャピックアップの名称": "assets/Quiz-icon/processed/ジャンル別画像/ピックアップ募集.png",
  "タイトルコール": "assets/Quiz-icon/processed/ジャンル別画像/タイトルコール.png",
  "戦闘スキル": "assets/Quiz-icon/processed/ジャンル別画像/戦闘スキル.png",
  "キャラ性能": "assets/Quiz-icon/processed/ジャンル別画像/キャラ性能.png",
  "ストーリー内容": "assets/Quiz-icon/processed/ジャンル別画像/ストーリー内容.png",
  "メモロビ・ズームイン": "assets/Quiz-icon/processed/ジャンル別画像/メモロビズームイン.png",
  "プロフィール内容": "assets/Quiz-icon/processed/ジャンル別画像/プロフィール内容.png",
  "ヘイロー": "assets/Quiz-icon/processed/ジャンル別画像/ヘイロー.png",
  "生徒の固有武器": "assets/Quiz-icon/processed/ジャンル別画像/固有武器.png",
  "ストーリー・イベント内容(小ネタ)": "assets/Quiz-icon/processed/ジャンル別画像/小ネタ.png",
};
const seoLandingPages = [
  {
    slug: "character",
    title: "ブルアカ キャラ クイズ",
    lead: "ブルーアーカイブの生徒名、シルエット、プロフィール内容を出題するキャラクタークイズです。",
    image: "assets/Quiz-icon/processed/ジャンル別画像/生徒の名前.png",
    links: [
      ["生徒シルエット", "生徒シルエット"],
      ["生徒の名前", "生徒の名前"],
      ["プロフィール内容", "プロフィール内容"],
    ],
  },
  {
    slug: "story",
    title: "ブルアカ ストーリー クイズ",
    lead: "ブルーアーカイブのメインストーリー、イベント内容、小ネタを出題するストーリークイズです。",
    image: "assets/Quiz-icon/processed/ジャンル別画像/ストーリー内容.png",
    links: [
      ["ストーリー内容", "ストーリー内容"],
      ["ストーリー・イベント内容(小ネタ)", "ストーリー・イベント内容(小ネタ)"],
    ],
  },
  {
    slug: "memory-lobby",
    title: "ブルアカ メモロビ クイズ",
    lead: "ブルーアーカイブのメモリアルロビー画像から生徒を当てるメモロビ・ズームインクイズです。",
    image: "assets/Quiz-icon/processed/ジャンル別画像/メモロビズームイン.png",
    links: [["メモロビ・ズームイン", "メモロビ・ズームイン"]],
  },
  {
    slug: "title-call",
    title: "ブルアカ タイトルコール クイズ",
    lead: "ブルーアーカイブのタイトルコール音声から生徒を当てる非公式クイズです。",
    image: "assets/Quiz-icon/processed/ジャンル別画像/タイトルコール.png",
    links: [["タイトルコール", "タイトルコール"]],
  },
  {
    slug: "skill",
    title: "ブルアカ スキル クイズ",
    lead: "ブルーアーカイブの戦闘スキル、キャラ性能、役割や攻撃タイプを確認できるスキルクイズです。",
    image: "assets/Quiz-icon/processed/ジャンル別画像/戦闘スキル.png",
    links: [
      ["戦闘スキル", "戦闘スキル"],
      ["キャラ性能", "キャラ性能"],
    ],
  },
  {
    slug: "weapon",
    title: "ブルアカ 固有武器 クイズ",
    lead: "ブルーアーカイブの生徒の固有武器を画像や名称から確認できる非公式クイズです。",
    image: "assets/Quiz-icon/processed/ジャンル別画像/固有武器.png",
    links: [["生徒の固有武器", "生徒の固有武器"]],
  },
  {
    slug: "halo",
    title: "ブルアカ ヘイロー クイズ",
    lead: "ブルーアーカイブの生徒のヘイローを見て名前を答える非公式クイズです。",
    image: "assets/Quiz-icon/processed/ジャンル別画像/ヘイロー.png",
    links: [["ヘイロー", "ヘイロー"]],
  },
];

function replaceBlock(source, startNeedle, endNeedle, replacement) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start);
  if (start === -1 || end === -1) {
    throw new Error(`Could not strip block: ${startNeedle}`);
  }
  return source.slice(0, start) + replacement + source.slice(end + endNeedle.length);
}

function makeRemoteOnlyScript(script) {
  let result = script.replace(/\r\n/g, "\n");
  result = replaceBlock(
    result,
    "const LOCAL_PERFORMANCE_STUDENTS = [",
    "const SUPABASE_CONFIG",
    "const LOCAL_PERFORMANCE_STUDENTS = [];\nconst SUPABASE_CONFIG",
  );
  result = replaceBlock(
    result,
    "const localMemolobby = [",
    "const PERFORMANCE_ICON_ASSETS",
    "const localMemolobby = [];\nconst PERFORMANCE_ICON_ASSETS",
  );
  result = replaceBlock(
    result,
    "const PERFORMANCE_ICON_ASSETS = {",
    "const students",
    "const PERFORMANCE_ICON_ASSETS = {};\nconst students",
  );
  result = replaceBlock(
    result,
    "const students = [",
    "const haloAssets",
    "const students = [];\nconst haloAssets",
  );
  result = replaceBlock(
    result,
    "const haloAssets = [",
    "const pickupBanners",
    "const haloAssets = [];\nconst pickupBanners",
  );
  result = replaceBlock(
    result,
    "const pickupBanners = [",
    "const pickupTitleCorrections",
    "const pickupBanners = [];\nconst pickupTitleCorrections",
  );
  result = replaceBlock(
    result,
    "const pickupTitleCorrections = [",
    "function normalizePickupTitle",
    "const pickupTitleCorrections = [];\n\nfunction normalizePickupTitle",
  );
  result = replaceBlock(
    result,
    "const storyQuestions = [",
    "let activeStudents",
    "const storyQuestions = [];\nlet activeStudents",
  );
  return result;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function appUrlForGenre(genre, mode = "practice") {
  const params = new URLSearchParams({
    mode,
    genre,
  });
  return `/?${params.toString()}`;
}

function imageForGenre(genre, fallback) {
  return genreThumbnails[genre] || fallback;
}

function buildSeoLandingPage(page) {
  const canonical = `${siteUrl}${page.slug}/`;
  const miniExamLinks = page.links
    .map(
      ([label, genre]) => `<a class="entry-button secondary" href="${appUrlForGenre(genre, "miniExam")}">
            <img src="/${escapeHtml(imageForGenre(genre, page.image))}" alt="" loading="lazy" />
            <span>${escapeHtml(label)} 小テストを始める</span>
          </a>`,
    )
    .join("\n          ");
  const officialLinkItems = officialLinks
    .map(
      ([label, url]) =>
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
    )
    .join("\n          ");

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.lead)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.lead)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${siteUrl}og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.lead)}" />
    <meta name="twitter:image" content="${siteUrl}og-image.png" />
    <meta name="robots" content="max-image-preview:large" />
    <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />
    <link rel="apple-touch-icon" href="/favicon-96x96.png" />
    <script type="application/ld+json">
      ${JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.lead,
          url: canonical,
          isPartOf: {
            "@type": "WebSite",
            name: "ブルアカ クイズ 総合",
            url: siteUrl,
          },
          inLanguage: "ja",
        },
        null,
        8,
      )}
    </script>
    <style>
      :root {
        color-scheme: light;
        --blue: #2f8dff;
        --cyan: #33c0df;
        --ink: #172238;
        --muted: #5f6f8b;
      }
      * { box-sizing: border-box; }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        color: var(--ink);
        font-family: "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
        background:
          linear-gradient(120deg, rgba(209, 244, 255, 0.72), rgba(255, 230, 242, 0.72)),
          repeating-linear-gradient(90deg, rgba(47, 141, 255, 0.06) 0 1px, transparent 1px 54px),
          repeating-linear-gradient(0deg, rgba(47, 141, 255, 0.05) 0 1px, transparent 1px 54px);
      }
      main {
        width: min(880px, 100%);
        padding: clamp(28px, 6vw, 64px);
        border: 1px solid rgba(255, 255, 255, 0.78);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.82);
        box-shadow: 0 28px 80px rgba(38, 83, 148, 0.16);
      }
      .kicker {
        margin: 0 0 12px;
        color: var(--blue);
        font-size: 0.78rem;
        font-weight: 900;
        text-transform: uppercase;
      }
      h1 {
        margin: 0 0 18px;
        font-size: clamp(2.3rem, 8vw, 4.4rem);
        line-height: 1;
        letter-spacing: 0;
      }
      p {
        max-width: 46rem;
        margin: 0 0 28px;
        color: var(--muted);
        font-size: 1.05rem;
        font-weight: 750;
        line-height: 1.7;
      }
      .entry-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        gap: 12px;
        margin-top: 18px;
      }
      .entry-actions.is-single {
        max-width: 360px;
      }
      .entry-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 168px;
        padding: 8px;
        border-radius: 8px;
        color: #fff;
        background: linear-gradient(135deg, var(--blue), var(--cyan));
        font-weight: 900;
        text-align: center;
        text-decoration: none;
        box-shadow: 0 14px 30px rgba(47, 141, 255, 0.18);
      }
      .entry-button img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: contain;
        border: 1px solid rgba(255, 255, 255, 0.62);
        border-radius: 7px;
        background: #eef8ff;
        box-shadow: inset 0 0 0 1px rgba(47, 141, 255, 0.12);
      }
      .entry-button span {
        display: flex;
        min-height: 2.2em;
        align-items: center;
        justify-content: center;
        line-height: 1.25;
      }
      .entry-button.secondary {
        color: var(--blue);
        background: rgba(47, 141, 255, 0.1);
        box-shadow: none;
      }
      .official-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid rgba(47, 141, 255, 0.16);
      }
      .official-links a {
        display: inline-flex;
        align-items: center;
        min-height: 34px;
        padding: 6px 11px;
        border: 1px solid rgba(47, 141, 255, 0.22);
        border-radius: 8px;
        color: var(--blue);
        background: rgba(255, 255, 255, 0.74);
        font-size: 0.84rem;
        font-weight: 900;
        text-decoration: none;
      }
      .official-links a::after {
        content: "↗";
        margin-left: 6px;
        font-size: 0.72rem;
        opacity: 0.72;
      }
      .home-link {
        display: inline-flex;
        margin-top: 26px;
        color: var(--blue);
        font-weight: 900;
        text-decoration: none;
      }
      @media (max-width: 720px) {
        body { padding: 10px; }
        main { padding: 24px 16px; }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="kicker">Blue Archive Fan Quiz</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.lead)}</p>
      <section aria-label="小テストを始める">
        <div class="entry-actions${page.links.length === 1 ? " is-single" : ""}">
          ${miniExamLinks}
        </div>
      </section>
      <nav class="official-links" aria-label="ブルーアーカイブ公式リンク">
          ${officialLinkItems}
      </nav>
      <a class="home-link" href="/">ブルアカ クイズ 総合へ戻る</a>
    </main>
  </body>
</html>
`;
}

function writeSeoLandingPages() {
  seoLandingPages.forEach((page) => {
    const pageDir = path.join(distDir, page.slug);
    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, "index.html"), buildSeoLandingPage(page), "utf8");
  });
}

function copyFileOrWriteFallback(source, destination, fallback) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    return;
  }
  fs.writeFileSync(destination, fallback);
}

function writeFallbackGenreImages() {
  Object.values(genreThumbnails).forEach((relativePath) => {
    const destination = path.join(distDir, relativePath);
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, fallbackPng);
    }
  });
}

function fallbackSvg(label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#eef8ff"/>
  <circle cx="820" cy="245" r="120" fill="none" stroke="#b8d8ff" stroke-width="26" opacity=".72"/>
  <text x="80" y="300" fill="#172238" font-family="Arial, sans-serif" font-size="74" font-weight="700">${escapeHtml(label)}</text>
  <text x="84" y="370" fill="#2f8dff" font-family="Arial, sans-serif" font-size="34" font-weight="700">Fan Quiz</text>
</svg>`;
}

const html = fs.readFileSync(indexPath, "utf8");
const css = fs.readFileSync(stylesPath, "utf8");
const js = makeRemoteOnlyScript(fs.readFileSync(scriptPath, "utf8"));

const bundled = html
  .replace(
    /<link rel="stylesheet" href="styles\.css"\s*\/>/,
    () => `<style>\n${css}\n    </style>`,
  )
  .replace(
    /\s*<script src="script\.js"><\/script>/,
    () => `\n    <script>\n${js}\n    </script>`,
  );

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outputPath, bundled, "utf8");
copyFileOrWriteFallback(faviconPath, distFaviconPath, fallbackSvg("BA Quiz"));
copyFileOrWriteFallback(faviconPngPath, distFaviconPngPath, fallbackPng);
copyFileOrWriteFallback(ogImagePath, distOgImagePath, fallbackSvg("Blue Archive Quiz"));
copyFileOrWriteFallback(ogImagePngPath, distOgImagePngPath, fallbackPng);
if (fs.existsSync(quizIconAssetsPath)) {
  fs.cpSync(quizIconAssetsPath, distQuizIconAssetsPath, { recursive: true });
}
writeFallbackGenreImages();
writeSeoLandingPages();
fs.writeFileSync(
  headersPath,
  `/*
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' https://tljytuvwivrmwlqnnotz.supabase.co https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com; font-src 'self' data:; manifest-src 'self'; worker-src 'self' blob:; upgrade-insecure-requests
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=0, must-revalidate

/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=0, must-revalidate
`,
  "utf8",
);
fs.writeFileSync(
  redirectsPath,
  `/.env /404.html 404
/.env* /404.html 404
/.git/* /404.html 404
/supabase/* /404.html 404
`,
  "utf8",
);
fs.writeFileSync(
  notFoundPath,
  `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>ページが見つかりません</title>
    <style>
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        color: #172033;
        background: linear-gradient(135deg, #e7f7ff, #fff7fb);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(92vw, 520px);
        padding: 32px;
        border: 1px solid rgba(47, 141, 255, 0.18);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 18px 44px rgba(57, 91, 140, 0.16);
      }
      h1 { margin: 0 0 12px; font-size: 1.7rem; }
      p { margin: 0 0 20px; color: #5c6b86; line-height: 1.7; }
      a {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        padding: 0 18px;
        border-radius: 8px;
        color: #fff;
        background: #2f8dff;
        font-weight: 800;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>ページが見つかりません</h1>
      <p>URLが変更されたか、存在しないページです。</p>
      <a href="/">トップへ戻る</a>
    </main>
  </body>
</html>
`,
  "utf8",
);
fs.writeFileSync(
  sitemapPath,
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${seoLandingPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.slug}/</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`,
  "utf8",
);
fs.writeFileSync(
  robotsPath,
  `User-agent: *
Allow: /

Sitemap: ${siteUrl}sitemap.xml
`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      output: outputPath,
      bytes: Buffer.byteLength(bundled),
      favicon: distFaviconPath,
      faviconPng: distFaviconPngPath,
      ogImage: distOgImagePath,
      ogImagePng: distOgImagePngPath,
      headers: headersPath,
      redirects: redirectsPath,
      notFound: notFoundPath,
      sitemap: sitemapPath,
      robots: robotsPath,
    },
    null,
    2,
  ),
);
