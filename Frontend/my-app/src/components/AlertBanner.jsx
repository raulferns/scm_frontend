/**
 * AlertBanner — styled dismissible high-risk alert.
 * Props preserved: count
 */
export default function AlertBanner({ count }) {
  return (
    <div className="mx-6 mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl shadow-sm">
      <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-600">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">
          {count} High-Risk Shipment{count > 1 ? "s" : ""} Detected
        </p>
        <p className="text-xs text-red-600 mt-0.5">
          Immediate attention required — check the table below for details.
        </p>
      </div>
      <span className="badge bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1">
        {count} Alert{count > 1 ? "s" : ""}
      </span>
    </div>
  );
}