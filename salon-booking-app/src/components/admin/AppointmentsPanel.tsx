"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointment, deleteAppointment, restoreAppointment } from "@/lib/actions/appointments";
import { categoryColor } from "@/lib/category-style";
import { formatDisplayTime } from "@/lib/data";
import { AppointmentFormModal, type EditingAppointment } from "./AppointmentFormModal";

export type AppointmentRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  note: string | null;
  service: { id: string; name: string; durationMin: number; category: { slug: string; name: string } };
  client: { id: string; name: string; phone: string; email: string | null };
};

type ServiceOption = { id: string; name: string; durationMin: number; categoryName: string };

function dateLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function AppointmentCard({
  appt,
  onEdit,
}: {
  appt: AppointmentRow;
  onEdit: (a: AppointmentRow) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const color = categoryColor(appt.service.category.slug);
  const cancelled = appt.status === "cancelled";

  return (
    <li
      className="flex flex-col gap-2 rounded-sm border border-line bg-paper-soft p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderLeft: `3px solid ${cancelled ? "var(--color-line)" : color}`, opacity: cancelled ? 0.6 : 1 }}
    >
      <div className="min-w-0">
        <p className="font-display text-base text-ink">
          {formatDisplayTime(appt.startTime)} – {formatDisplayTime(appt.endTime)}{" "}
          <span className="text-ink-soft">· {appt.service.name}</span>
          {cancelled && <span className="ml-2 text-xs text-primary">Cancelled</span>}
        </p>
        <p className="text-sm text-ink-soft">
          {appt.client.name} · {appt.client.phone}
          {appt.client.email ? ` · ${appt.client.email}` : ""}
        </p>
        {appt.note && <p className="mt-1 text-sm italic text-ink-soft">&ldquo;{appt.note}&rdquo;</p>}
      </div>

      <div className="flex shrink-0 gap-3 text-sm">
        {!cancelled && (
          <button onClick={() => onEdit(appt)} className="text-ink-soft hover:text-primary">
            Edit
          </button>
        )}
        {!cancelled ? (
          <button
            disabled={pending}
            onClick={() => startTransition(async () => {
              await cancelAppointment(appt.id);
              router.refresh();
            })}
            className="text-ink-soft hover:text-primary"
          >
            Cancel
          </button>
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(async () => {
              await restoreAppointment(appt.id);
              router.refresh();
            })}
            className="text-ink-soft hover:text-primary"
          >
            Restore
          </button>
        )}
        <button
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this appointment permanently?")) {
              startTransition(async () => {
                await deleteAppointment(appt.id);
                router.refresh();
              });
            }
          }}
          className="text-ink-soft hover:text-primary"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export function AppointmentsPanel({
  appointments,
  services,
  view,
  date,
  weekDates,
}: {
  appointments: AppointmentRow[];
  services: ServiceOption[];
  view: "day" | "week";
  date: string;
  weekDates: string[];
}) {
  const [modal, setModal] = useState<"new" | AppointmentRow | null>(null);

  function toEditing(a: AppointmentRow): EditingAppointment {
    return {
      id: a.id,
      serviceId: a.service.id,
      date: a.date,
      startTime: a.startTime,
      clientName: a.client.name,
      clientPhone: a.client.phone,
      clientEmail: a.client.email ?? "",
      note: a.note ?? "",
    };
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setModal("new")}
          className="rounded-sm bg-primary px-4 py-2 text-sm text-paper-soft hover:bg-primary-dark"
        >
          + New appointment
        </button>
      </div>

      {view === "day" && (
        <>
          {appointments.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing booked for this day yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {appointments.map((a) => (
                <AppointmentCard key={a.id} appt={a} onEdit={(x) => setModal(x)} />
              ))}
            </ul>
          )}
        </>
      )}

      {view === "week" && (
        <div className="flex flex-col gap-8">
          {weekDates.map((d) => {
            const dayAppts = appointments.filter((a) => a.date === d);
            return (
              <div key={d}>
                <p className="mb-3 font-display text-lg text-ink">{dateLabel(d)}</p>
                {dayAppts.length === 0 ? (
                  <p className="text-sm text-ink-soft">Nothing booked.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {dayAppts.map((a) => (
                      <AppointmentCard key={a.id} appt={a} onEdit={(x) => setModal(x)} />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <AppointmentFormModal
          services={services}
          defaultDate={date}
          editing={modal === "new" ? undefined : toEditing(modal)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
