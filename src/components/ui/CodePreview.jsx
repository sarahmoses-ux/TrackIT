import { buildBarcodePattern, buildQrMatrix } from "../../utils/productCodes";

export function BarcodePreview({ className = "", value }) {
  const bars = buildBarcodePattern(value);

  return (
    <div className={`rounded-2xl border border-border bg-white p-3 ${className}`}>
      <div className="flex h-14 items-end gap-px overflow-hidden">
        {bars.map((active, index) => (
          <span
            key={`${value}-${index}`}
            className={`${active ? "bg-slate-900" : "bg-transparent"} block h-full w-1 rounded-sm`}
          />
        ))}
      </div>
      <p className="mt-2 truncate font-mono text-[11px] text-muted">{value}</p>
    </div>
  );
}

export function QrPreview({ className = "", size = 17, value }) {
  const matrix = buildQrMatrix(value, size);

  return (
    <div className={`rounded-2xl border border-border bg-white p-3 ${className}`}>
      <div
        className="grid w-fit gap-px rounded-lg bg-white"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {matrix.flatMap((row, rowIndex) =>
          row.map((filled, colIndex) => (
            <span
              key={`${rowIndex}-${colIndex}`}
              className={`block h-2.5 w-2.5 rounded-[2px] ${filled ? "bg-slate-900" : "bg-slate-100"}`}
            />
          )),
        )}
      </div>
      <p className="mt-2 truncate font-mono text-[11px] text-muted">{value}</p>
    </div>
  );
}
