import type { ParsedLine } from "@/lib/cifra/parser";

export function ChordSheet({
  lines,
  showChords = true,
  chordColorClass = "text-primary",
}: {
  lines: ParsedLine[];
  showChords?: boolean;
  chordColorClass?: string;
}) {
  return (
    <div className="overflow-x-auto font-[family-name:var(--font-cifra-mono)] text-[length:var(--cifra-font-size,1rem)] leading-relaxed">
      {lines.map((line, i) =>
        line.isObservacao ? (
          <blockquote
            key={i}
            className="my-1 border-l-2 border-sky-400 pl-3 italic whitespace-pre-wrap text-sky-600 dark:border-sky-500 dark:text-sky-400"
          >
            {line.lyrics}
          </blockquote>
        ) : (
        <div key={i} className="whitespace-pre">
          {showChords && line.chords.length > 0 && (
            <div className={`relative h-[1.4em] font-bold ${chordColorClass}`}>
              {line.chords.map((chord, j) => (
                <span key={j} className="absolute" style={{ left: `${chord.column}ch` }}>
                  {chord.text}
                </span>
              ))}
            </div>
          )}
          <div>{line.lyrics || " "}</div>
        </div>
        )
      )}
    </div>
  );
}
