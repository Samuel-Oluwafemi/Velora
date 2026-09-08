import type { Dispatch, SetStateAction } from "react";

export type OrderSort = "newest" | "oldest";

interface OrderFiltersProps {
  search: string;
  status: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  sort: OrderSort;
  filteredCount: number;
  totalCount: number;
  setSearch: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setPaymentStatus: Dispatch<SetStateAction<string>>;
  setDateFrom: Dispatch<SetStateAction<string>>;
  setDateTo: Dispatch<SetStateAction<string>>;
  setSort: Dispatch<SetStateAction<OrderSort>>;
}

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.72rem",
};

export function OrderFilters({
  search,
  status,
  paymentStatus,
  dateFrom,
  dateTo,
  sort,
  filteredCount,
  totalCount,
  setSearch,
  setStatus,
  setPaymentStatus,
  setDateFrom,
  setDateTo,
  setSort,
}: OrderFiltersProps) {
  const hasFilters = search || status !== "all" || paymentStatus !== "all" || dateFrom || dateTo || sort !== "newest";

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
  }

  return (
    <div className="bg-secondary p-4 mb-6" style={{ border: "1px solid #E5E7EB" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <label className="text-muted-foreground" style={labelStyle}>
          Search orders
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID, customer, email, product" className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground" />
        </label>
        <label className="text-muted-foreground" style={labelStyle}>
          Order status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="text-muted-foreground" style={labelStyle}>
          Payment status
          <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground">
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="success">Successful</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label className="text-muted-foreground" style={labelStyle}>
          Sort by date
          <select value={sort} onChange={(event) => setSort(event.target.value as OrderSort)} className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <label className="text-muted-foreground" style={labelStyle}>
          From date and time
          <input type="datetime-local" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground" />
        </label>
        <label className="text-muted-foreground" style={labelStyle}>
          To date and time
          <input type="datetime-local" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground" />
        </label>
      </div>
      <div className="flex items-center justify-between gap-3 mt-4">
        <p className="text-muted-foreground" style={{ fontSize: "0.82rem" }}>Showing {filteredCount} of {totalCount} orders</p>
        {hasFilters && <button type="button" onClick={clearFilters} className="text-muted-foreground hover:text-foreground" style={{ ...labelStyle, letterSpacing: "0.1em", textTransform: "uppercase" }}>Clear filters</button>}
      </div>
    </div>
  );
}
