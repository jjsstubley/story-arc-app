import { toaster } from "~/components/ui/toaster";
import { getErrorMessage } from "~/shared/errors";

/** Standard error toast for a failed mutation */
export function notifyError(title: string, error: unknown) {
  toaster.create({
    type: "error",
    title,
    description: getErrorMessage(error),
    closable: true,
  });
}
