// columns: [{ key, label, sortable, render }]; sorting is handled by the parent (server-side).
export default function DataTable({ columns, rows, sort, order, onSort, empty = 'Nothing to show yet.' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} aria-sort={sort === c.key ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
                {c.sortable ? (
                  <button className="sort" onClick={() => onSort(c.key)}>
                    {c.label}
                    <span aria-hidden="true">{sort === c.key ? (order === 'asc' ? ' ▲' : ' ▼') : ' ↕'}</span>
                  </button>
                ) : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="empty">{empty}</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Small helper hook-like function for toggling sort state.
export const nextSort = (cur, key) =>
  cur.sort === key ? { sort: key, order: cur.order === 'asc' ? 'desc' : 'asc' } : { sort: key, order: 'asc' };
