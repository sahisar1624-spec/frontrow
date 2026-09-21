"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function updateClientNotes(id: string, formData: FormData) {
  await requireAdmin();
  const notes = String(formData.get("notes") || "");
  await prisma.client.update({ where: { id }, data: { notes } });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
}
