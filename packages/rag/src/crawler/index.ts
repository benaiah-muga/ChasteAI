import * as cheerio from "cheerio"

export type CrawledPage = {
  url: string
  title: string
  content: string
}

export type CrawlOptions = {
  maxPages?: number
  maxDepth?: number
}

export type CrawlProgress = {
  visited: number
  total: number
  currentUrl: string
  pages: CrawledPage[]
}

function normalizeUrl(base: string, href: string): string | null {
  try {
    const url = new URL(href, base)
    url.hash = ""
    return url.href
  } catch {
    return null
  }
}

function isSameDomain(url: string, baseDomain: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === baseDomain
  } catch {
    return false
  }
}

function extractText($: cheerio.CheerioAPI): string {
  $("script, style, nav, header, footer, noscript").remove()
  const body = $("body")
  if (!body.length) return ""
  const text = body.text()
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim()
}

export async function crawlSite(
  rootUrl: string,
  options: CrawlOptions = {},
  onProgress?: (progress: CrawlProgress) => void,
): Promise<CrawledPage[]> {
  const { maxPages = 50, maxDepth = 3 } = options

  const seen = new Set<string>()
  const pages: CrawledPage[] = []

  let rootHostname: string
  try {
    rootHostname = new URL(rootUrl).hostname
  } catch {
    throw new Error("Invalid root URL")
  }

  const queue: { url: string; depth: number }[] = [{ url: rootUrl, depth: 0 }]

  while (queue.length > 0 && pages.length < maxPages) {
    const entry = queue.shift()
    if (!entry) break
    const { url, depth } = entry

    if (seen.has(url)) continue
    seen.add(url)

    if (onProgress) {
      onProgress({ visited: seen.size, total: queue.length + pages.length, currentUrl: url, pages: [...pages] })
    }

    if (depth > maxDepth) continue

    let html: string
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "ChasteAI-Crawler/1.0" },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      html = await res.text()
    } catch {
      continue
    }

    const $ = cheerio.load(html)
    const title = $("title").first().text().trim() || url
    const content = extractText($)

    if (content.length > 50) {
      pages.push({ url, title, content })
    }

    if (depth < maxDepth && pages.length < maxPages) {
      const links = new Set<string>()
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href")
        if (!href) return
        const normalized = normalizeUrl(url, href)
        if (!normalized) return
        if (!isSameDomain(normalized, rootHostname)) return
        links.add(normalized)
      })

      for (const link of links) {
        if (!seen.has(link)) {
          queue.push({ url: link, depth: depth + 1 })
        }
      }
    }
  }

  return pages
}
