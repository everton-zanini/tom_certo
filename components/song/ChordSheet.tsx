import { type BlockKind, type ParsedLine } from "@/lib/cifra/parser";

// Full class names must stay literal so Tailwind can detect them.
const BLOCK_STYLES: Record<BlockKind, string> = {
  "pre-refrao": "border-bloco-pre-refrao",
  refrao: "border-bloco-refrao",
  verso: "border-bloco-verso",
  ponte: "border-bloco-ponte",
  interludio: "border-bloco-interludio",
};

type Group = { block?: BlockKind; lines: ParsedLine[] };

function groupByBlock(lines: ParsedLine[]): Group[] {
  const groups: Group[] = [];
  for (const line of lines) {
    const last = groups[groups.length - 1];
    if (last && last.block === line.block && !line.blockStart) {
      last.lines.push(line);
    } else {
      groups.push({ block: line.block, lines: [line] });
    }
  }
  return groups;
}

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
      {groupByBlock(lines).map((group, g) => {
        const rows = group.lines.map((line, i) =>
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
                <div className={`relative h-[1.4em] font-bold not-italic ${chordColorClass}`}>
                  {line.chords.map((chord, j) => (
                    <span key={j} className="absolute" style={{ left: `${chord.column}ch` }}>
                      {chord.text}
                    </span>
                  ))}
                </div>
              )}
              <div>{line.lyrics || " "}</div>
            </div>
          )
        );

        if (!group.block) return <div key={g}>{rows}</div>;
        return (
          <section key={g} className={`my-2 border-l-[3px] pl-3 ${BLOCK_STYLES[group.block]}`}>
            {rows}
          </section>
        );
      })}
    </div>
  );
}
