import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { Checkbox } from './forms';
import { Icon } from './Icon';
import { cx } from './util';

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Cell renderer. Defaults to `row[key]`. */
  render?: (row: T) => ReactNode;
  /** Value used for sorting. Defaults to `row[key]`. Presence of `sortable` enables the header button. */
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  /** Right-align and use tabular figures. */
  numeric?: boolean;
  width?: number | string;
  wrap?: boolean;
  /** Footer cell content (totals). */
  footer?: ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Show selection checkboxes. Controlled via selectedKeys/onSelectionChange, or uncontrolled. */
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Return detail content to make rows expandable. */
  expandable?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  /** Highlight this row as the active one (e.g. shown in an inspector). */
  activeKey?: string | null;
  striped?: boolean;
  hover?: boolean;
  flush?: boolean;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  emptyText?: ReactNode;
  caption?: string;
  maxHeight?: number | string;
  className?: string;
}

/** Sortable, selectable, expandable data table driven by table.* tokens. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  selectable,
  selectedKeys,
  onSelectionChange,
  expandable,
  onRowClick,
  activeKey,
  striped,
  hover = true,
  flush,
  initialSort,
  emptyText = 'No records',
  caption,
  maxHeight,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [innerSel, setInnerSel] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const sel = selectedKeys ?? innerSel;
  const setSel = (keys: string[]) => {
    if (!selectedKeys) setInnerSel(keys);
    onSelectionChange?.(keys);
  };

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = col.sortValue ?? ((r: T) => (r as Record<string, unknown>)[col.key] as string | number);
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va ?? '').localeCompare(String(vb ?? ''), undefined, { numeric: true }) * dir;
    });
  }, [rows, sort, columns]);

  const allKeys = rows.map(rowKey);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => sel.includes(k));
  const someSelected = allKeys.some((k) => sel.includes(k));
  const span = columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);
  const hasFooter = columns.some((c) => c.footer != null);
  const cellClass = (c: Column<T>) => cx((c.numeric || c.align === 'right') && 'is-num', c.align === 'center' && 'is-center', c.wrap && 'is-wrap');

  const toggleSort = (key: string) =>
    setSort((cur) => (cur?.key !== key ? { key, dir: 'asc' } : cur.dir === 'asc' ? { key, dir: 'desc' } : null));

  return (
    <div className={cx('m-table-wrap', flush && 'm-table-wrap--flush', className)} style={{ maxHeight }}>
      <table className={cx('m-table', hover && 'm-table--hover', striped && 'm-table--striped')}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {expandable && <th className="m-table__check" aria-label="Expand" />}
            {selectable && (
              <th className="m-table__check">
                <Checkbox aria-label="Select all rows" checked={allSelected} indeterminate={!allSelected && someSelected} onChange={(c) => setSel(c ? allKeys : [])} />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} className={cellClass(c)} style={{ width: c.width }} aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable ? (
                    <button type="button" className={cx('m-table__sort', active && 'is-sorted')} onClick={() => toggleSort(c.key)}>
                      {c.header}
                      <Icon icon={active ? (sort!.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown} />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={span} className="m-table__empty">
                {emptyText}
              </td>
            </tr>
          )}
          {sorted.map((row) => {
            const key = rowKey(row);
            const isSel = sel.includes(key);
            const isOpen = expanded.includes(key);
            return (
              <Fragment key={key}>
                <tr className={cx((isSel || activeKey === key) && 'is-selected', onRowClick && 'is-clickable')} onClick={onRowClick ? () => onRowClick(row) : undefined} aria-selected={selectable ? isSel : undefined}>
                  {expandable && (
                    <td className="m-table__check">
                      <button
                        type="button"
                        className="m-table__expander"
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Collapse row' : 'Expand row'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded((cur) => (isOpen ? cur.filter((k) => k !== key) : [...cur, key]));
                        }}
                      >
                        <Icon icon={ChevronRight} size="sm" />
                      </button>
                    </td>
                  )}
                  {selectable && (
                    <td className="m-table__check" onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label="Select row" checked={isSel} onChange={(c) => setSel(c ? [...sel, key] : sel.filter((k) => k !== key))} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cellClass(c)}>
                      {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
                {expandable && isOpen && (
                  <tr className="m-table__detail">
                    <td colSpan={span}>{expandable(row)}</td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
        {hasFooter && (
          <tfoot>
            <tr>
              {expandable && <td />}
              {selectable && <td />}
              {columns.map((c) => (
                <td key={c.key} className={cellClass(c)}>
                  {c.footer}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
