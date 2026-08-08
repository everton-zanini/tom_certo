import type { ParsedLine } from "@/lib/cifra/parser";

export function ChordSheet({
  lines,
  showChords = true,
}: {
  lines: ParsedLine[];
  showChords?: boolean;
}) {
  return (
    <div className="overflow-x-auto font-[family-name:var(--font-cifra-mono)] text-[length:var(--cifra-font-size,1rem)] leading-relaxed">
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          {showChords && line.chords.length > 0 && (
            <div className="relative h-[1.4em] font-bold text-primary">
              {line.chords.map((chord, j) => (
                <span key={j} className="absolute" style={{ left: `${chord.column}ch` }}>
                  {chord.text}
                </span>
              ))}
            </div>
          )}
          <div>{line.lyrics || " "}</div>
        </div>
      ))}
    </div>
  );
}
