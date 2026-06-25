export interface Chunk {
  content: string
  index: number
}

export interface ChunkOptions {
  maxChunkSize?: number
  overlap?: number
  separator?: string
}

export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  const { maxChunkSize = 1000, overlap = 200, separator = "\n" } = options

  if (maxChunkSize <= 0) {
    throw new Error("maxChunkSize must be positive")
  }

  if (overlap >= maxChunkSize) {
    throw new Error("overlap must be less than maxChunkSize")
  }

  const chunks: Chunk[] = []
  const paragraphs = text.split(separator)
  let current = ""
  let index = 0

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue

    const withSeparator = current ? current + separator + paragraph : paragraph

    if (withSeparator.length <= maxChunkSize) {
      current = withSeparator
    } else {
      if (current) {
        chunks.push({ content: current.trim(), index })
        index++
      }

      if (paragraph.length > maxChunkSize) {
        for (let i = 0; i < paragraph.length; i += maxChunkSize - overlap) {
          const end = Math.min(i + maxChunkSize, paragraph.length)
          const content = paragraph.slice(i, end).trim()
          if (content) {
            chunks.push({ content, index })
            index++
          }
        }
        current = ""
      } else {
        current = paragraph
      }
    }
  }

  if (current.trim()) {
    chunks.push({ content: current.trim(), index })
  }

  if (chunks.length === 0 && text.trim()) {
    chunks.push({ content: text.trim(), index: 0 })
  }

  return chunks
}
