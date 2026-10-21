export const inr = (n: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
export const inrSigned = (n: number) => (n < 0 ? "-" : "") + inr(Math.abs(n));
export const todayISO = () => {
  const d = new Date(); const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};
export const fmtDate = (iso: string) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
export const monthStart = () => todayISO().slice(0, 8) + "01";
