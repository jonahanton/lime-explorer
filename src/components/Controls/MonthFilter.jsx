import styles from './MonthFilter.module.css';

function formatMonth(key) {
  const [year, month] = key.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function MonthFilter({ months, selected, onChange }) {
  if (!months.length) return null;

  return (
    <select
      className={styles.select}
      value={selected || ''}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label="Filter by month"
    >
      <option value="">All months</option>
      {months.map((m) => (
        <option key={m} value={m}>
          {formatMonth(m)}
        </option>
      ))}
    </select>
  );
}
