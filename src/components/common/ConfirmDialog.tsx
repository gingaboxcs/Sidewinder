import { t } from "../../lib/i18n";

interface Props {
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, isOpen, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 w-full max-w-xs p-5">
        <p className="text-sm text-app mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-app-muted hover:text-app transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded text-sm text-white cursor-pointer bg-red-600 hover:bg-red-500 transition-colors"
          >
            {t("delete_")}
          </button>
        </div>
      </div>
    </div>
  );
}
