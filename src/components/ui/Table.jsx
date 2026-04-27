import clsx from "../utils/clsx";

export default function Table({ children, className }) {
  return (
    <div className="table-shell">
      <table className={clsx("min-w-full divide-y divide-border text-left", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ columns }) {
  return (
    <thead className="bg-slate-50">
      <tr>
        {columns.map((column) => (
          <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableEmpty({ message }) {
  return (
    <tbody>
      <tr>
        <td className="px-4 py-12 text-center text-sm text-muted" colSpan={20}>
          {message}
        </td>
      </tr>
    </tbody>
  );
}
