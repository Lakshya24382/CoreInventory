export function ReceiptsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Receipts</h2>
          <p className="text-sm text-slate-400">
            Record and validate incoming stock.
          </p>
        </div>
        <button className="h-9 px-4 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500">
          New Receipt
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300">
        Receipts workflow UI to be implemented (create receipt, add supplier,
        add products, manager validation).
      </div>
    </div>
  );
}

