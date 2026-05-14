import { X } from "lucide-react";

const statusColors = {
  draft: "bg-gray-100 text-gray-600",
  done:  "bg-green-100 text-green-700",
};

export default function OperationDetailModal({ operation, type, onClose }) {
  if (!operation) return null;

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  );

  const renderMeta = () => {
    if (type === "receipt") return (
      <>
        <Field label="Supplier"     value={operation.supplier_name} />
        <Field label="Destination"  value={operation.location_name} />
      </>
    );
    if (type === "delivery") return (
      <>
        <Field label="Customer"  value={operation.customer_name} />
        <Field label="From"      value={operation.location_name} />
      </>
    );
    if (type === "transfer") return (
      <>
        <Field label="From" value={operation.from_location_name} />
        <Field label="To"   value={operation.to_location_name} />
      </>
    );
    if (type === "adjustment") return (
      <>
        <Field label="Location" value={operation.location_name} />
        <Field label="Reason"   value={operation.reason} />
      </>
    );
  };

  const renderLines = () => {
    if (!operation.lines?.length) return (
      <p className="text-sm text-gray-400">No line items</p>
    );

    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-medium text-gray-400 pb-2">Product</th>
            <th className="text-left text-xs font-medium text-gray-400 pb-2">SKU</th>
            {type === "receipt" && <>
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Expected</th>
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Received</th>
            </>}
            {type === "delivery" && <>
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Requested</th>
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Delivered</th>
            </>}
            {type === "transfer" && (
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Quantity</th>
            )}
            {type === "adjustment" && <>
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Recorded</th>
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Actual</th>
              <th className="text-right text-xs font-medium text-gray-400 pb-2">Diff</th>
            </>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {operation.lines.map((line, i) => (
            <tr key={i}>
              <td className="py-2 text-gray-800 font-medium">{line.product_name}</td>
              <td className="py-2 text-gray-400 font-mono text-xs">{line.sku}</td>
              {type === "receipt" && <>
                <td className="py-2 text-right text-gray-600">{line.expected_qty}</td>
                <td className="py-2 text-right text-gray-600">{line.received_qty}</td>
              </>}
              {type === "delivery" && <>
                <td className="py-2 text-right text-gray-600">{line.requested_qty}</td>
                <td className="py-2 text-right text-gray-600">{line.delivered_qty}</td>
              </>}
              {type === "transfer" && (
                <td className="py-2 text-right text-gray-600">{line.quantity}</td>
              )}
              {type === "adjustment" && <>
                <td className="py-2 text-right text-gray-600">{line.recorded_qty}</td>
                <td className="py-2 text-right text-gray-600">{line.actual_qty}</td>
                <td className={`py-2 text-right font-semibold ${
                  parseFloat(line.difference) < 0 ? "text-red-500" :
                  parseFloat(line.difference) > 0 ? "text-green-600" : "text-gray-400"
                }`}>
                  {parseFloat(line.difference) > 0 ? "+" : ""}{line.difference}
                </td>
              </>}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <p className="font-mono text-sm text-gray-400">{operation.reference}</p>
            <h2 className="text-lg font-semibold text-gray-900 capitalize mt-0.5">{type} Details</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[operation.status] || statusColors.draft}`}>
              {operation.status}
            </span>
            <button onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* Created by */}
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-400 font-medium mb-2">Created by</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
                {operation.created_by_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  {operation.created_by_name || "Unknown"}
                </p>
                {operation.created_by_emp_id && (
                  <p className="text-xs text-indigo-500 font-mono">
                    {operation.created_by_emp_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Operation details */}
          <div className="grid grid-cols-2 gap-4">
            {renderMeta()}
            <Field
              label="Created at"
              value={new Date(operation.created_at).toLocaleString()}
            />
            {operation.validated_at && (
              <Field
                label="Validated at"
                value={new Date(operation.validated_at).toLocaleString()}
              />
            )}
          </div>

          {/* Line items */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-3">Line items</p>
            {renderLines()}
          </div>
        </div>
      </div>
    </div>
  );
}