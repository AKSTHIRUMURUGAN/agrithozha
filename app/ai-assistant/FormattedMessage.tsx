interface FormattedMessageProps {
  content: string
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  // Function to format the message content
  const formatContent = (text: string) => {
    // Split by lines to preserve line breaks
    const lines = text.split("\n")

    return lines.map((line, lineIndex) => {
      // Process each line for formatting
      const parts = []
      let currentIndex = 0

      // Regular expressions for different formatting
      const boldRegex = /\*\*(.*?)\*\*/g
      const urlRegex = /(https?:\/\/[^\s]+)/g

      // Find all matches for bold text and URLs
      const allMatches = []

      // Find bold matches
      let boldMatch
      while ((boldMatch = boldRegex.exec(line)) !== null) {
        allMatches.push({
          type: "bold",
          start: boldMatch.index,
          end: boldMatch.index + boldMatch[0].length,
          content: boldMatch[1],
          fullMatch: boldMatch[0],
        })
      }

      // Find URL matches
      let urlMatch
      while ((urlMatch = urlRegex.exec(line)) !== null) {
        allMatches.push({
          type: "url",
          start: urlMatch.index,
          end: urlMatch.index + urlMatch[0].length,
          content: urlMatch[1],
          fullMatch: urlMatch[0],
        })
      }

      // Sort matches by start position
      allMatches.sort((a, b) => a.start - b.start)

      // Process the line with formatting
      allMatches.forEach((match, index) => {
        // Add text before this match
        if (match.start > currentIndex) {
          parts.push(line.slice(currentIndex, match.start))
        }

        // Add the formatted match
        if (match.type === "bold") {
          parts.push(
            <strong key={`bold-${lineIndex}-${index}`} className="font-semibold text-gray-900">
              {match.content}
            </strong>,
          )
        } else if (match.type === "url") {
          parts.push(
            <a
              key={`url-${lineIndex}-${index}`}
              href={match.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline font-medium"
            >
              {match.content}
            </a>,
          )
        }

        currentIndex = match.end
      })

      // Add remaining text after last match
      if (currentIndex < line.length) {
        parts.push(line.slice(currentIndex))
      }

      // If no matches found, just add the line as is
      if (parts.length === 0) {
        parts.push(line)
      }

      return (
        <div key={lineIndex}>
          {parts.map((part, partIndex) => (typeof part === "string" ? <span key={partIndex}>{part}</span> : part))}
          {lineIndex < lines.length - 1 && <br />}
        </div>
      )
    })
  }

  return <div className="whitespace-pre-wrap">{formatContent(content)}</div>
}
