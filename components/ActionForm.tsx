"use client";

import { useEffect, useRef, useState, useTransition } from "react";

type Confirm = { title: string; body?: string; label?: string; danger?: boolean };

type Props = {
  action: (fd: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Show a confirm modal before running the action. */
  confirm?: Confirm;
  pendingText?: string;
  successText?: string;
  /** Clear the form after success (for "add" forms). */
  resetOnSuccess?: boolean;
};

type Status = "idle" | "saved" | "error";

export function ActionForm({
  action, children, className, id, confirm,
  pendingText = "Saving…", successText = "Saved", resetOnSuccess,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus("idle"), status === "error" ? 4000 : 1800);
    return () => clearTimeout(t);
  }, [status]);

  function run() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form); // read before anything changes
    setStatus("idle");
    startTransition(async () => {
      try {
        await action(data);
        if (resetOnSuccess) form.reset();
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // browser has already validated required/url fields
    if (pending) return;
    if (confirm) dialogRef.current?.showModal();
    else run();
  }

  return (
    <form ref={formRef} id={id} action={undefined} onSubmit={onSubmit} className={className} aria-busy={pending}>
      {children}

      {confirm && (
        <dialog
          ref={dialogRef}
          className="m-auto w-[min(92vw,24rem)] rounded-3xl border-2 border-ink bg-white p-6 text-ink backdrop:bg-black/50"
        >
          <h2 className="text-xl font-extrabold">{confirm.title}</h2>
          {confirm.body && <p className="mt-2 text-sm opacity-70">{confirm.body}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn bg-white text-sm" onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button
              type="button"
              autoFocus
              className={`btn text-sm ${confirm.danger ? "bg-red-500 text-white" : "btn-primary"}`}
              onClick={() => {
                dialogRef.current?.close();
                run();
              }}
            >
              {confirm.label ?? "Confirm"}
            </button>
          </div>
        </dialog>
      )}

      {pending && (
        <div className="fixed inset-0 z-50 grid cursor-wait place-items-center bg-black/30" role="status" aria-live="polite">
          <div className="flex items-center gap-3 rounded-full border-2 border-ink bg-white px-6 py-3 font-semibold text-ink">
            <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-ink/20 border-t-amber-deep" />
            {pendingText}
          </div>
        </div>
      )}

      {status !== "idle" && !pending && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 border-ink px-5 py-2 text-sm font-semibold shadow-lg ${
            status === "saved" ? "bg-amber text-ink" : "bg-red-500 text-white"
          }`}
        >
          {status === "saved" ? `✓ ${successText}` : "Something went wrong — try again"}
        </div>
      )}
    </form>
  );
}
