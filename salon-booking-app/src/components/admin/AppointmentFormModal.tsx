"use client";

import { useActionState, useEffect } from "react";
import { createAppointmentAdmin, updateAppointment } from "@/lib/actions/appointments";

type ServiceOption = {
  id: string;
  name: string;
  durationMin: number;
  categoryName: string;
};

export type EditingAppointment = {
  id: string;
  serviceId: string;
  date: string;
  startTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  note: string;
};

export function AppointmentFormModal({
  services,
  defaultDate,
  editing,
  onClose,
}: {
  services: ServiceOption[];
  defaultDate: string;
  editing?: EditingAppointment;
  onClose: () => void;
}) {
  const action = editing ? updateAppointment : createAppointmentAdmin;
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[1px] md:items-center">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-xl bg-paper-soft shadow-xl md:rounded-xl">
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--color-line)" }}>
          <p className="font-display text-xl text-ink">
            {editing ? "Edit appointment" : "New appointment"}
          </p>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-ink-soft hover:text-ink">
            &times;
          </button>
        </div>

        <form action={formAction} className="flex-1 overflow-y-auto px-6 py-5">
          {editing && <input type="hidden" name="id" value={editing.id} />}

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Service
              <select
                name="serviceId"
                required
                defaultValue={editing?.serviceId ?? ""}
                className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
              >
                <option value="" disabled>
                  Choose a service
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.categoryName} — {s.name} ({s.durationMin} min)
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
                Date
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={editing?.date ?? defaultDate}
                  className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
                Time
                <input
                  type="time"
                  name="startTime"
                  required
                  defaultValue={editing?.startTime ?? ""}
                  className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm text-ink">
              Client name
              <input
                name="name"
                required
                defaultValue={editing?.clientName}
                className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
              />
            </label>

            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
                Phone
                <input
                  name="phone"
                  required
                  type="tel"
                  defaultValue={editing?.clientPhone}
                  className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
                Email
                <input
                  name="email"
                  type="email"
                  defaultValue={editing?.clientEmail}
                  className="rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm text-ink">
              Note
              <textarea
                name="note"
                defaultValue={editing?.note}
                className="min-h-16 resize-none rounded-sm border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-primary"
              />
            </label>

            {state?.error && <p className="text-sm text-primary">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 rounded-sm bg-primary px-4 py-2.5 text-sm text-paper-soft transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {pending ? "Saving…" : editing ? "Save changes" : "Add appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
