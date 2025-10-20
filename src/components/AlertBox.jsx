import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";

export default function AlertBox({ title = "Attention needed", message }) {
  if (!message) return null;

  return (
    <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
      <div className="flex">
        <div className="shrink-0">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="size-5 text-yellow-400"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">{title}</h3>
          <div className="mt-1 text-sm text-yellow-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
