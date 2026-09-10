"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceForm } from "@/components/admin/services/service-form";
import { ServicesList } from "@/components/admin/services/services-list";
import type { Service } from "@/lib/config/services";

export function ServicesManagerV2({ initialServices }: { initialServices: Service[] }) {
  const [items, setItems] = useState(initialServices); const [editing, setEditing] = useState<Service | undefined>(); const [showNewForm, setShowNewForm] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function save(service: Service) { setBusy(true); setError(""); try { const response = await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(service) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Couldn't save service."); setItems(data.services); setEditing(undefined); setShowNewForm(false); } catch (e) { setError(e instanceof Error ? e.message : "Couldn't save service."); } finally { setBusy(false); } }
  async function setActive(id: string, active: boolean) { setBusy(true); setError(""); try { const response = await fetch("/api/admin/services", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Couldn't update service."); setItems(data.services); } catch (e) { setError(e instanceof Error ? e.message : "Couldn't update service."); } finally { setBusy(false); } }
  function duplicate(service: Service) { const copy = { ...service, id: `${service.id}-copy`, name: `${service.name} (copy)`, order: Math.max(...items.map((item) => item.order), 0) + 1 }; setEditing(copy); setShowNewForm(false); }
  function closeEditor() { setEditing(undefined); setShowNewForm(false); }
  return <>
    <div className="flex justify-end"><Button type="button" onClick={() => { setEditing(undefined); setShowNewForm(true); }}><Plus aria-hidden="true" className="size-4" />Add service</Button></div>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
    <ServicesList services={items} editingId={editing?.id} onEdit={(service) => { setEditing(service); setShowNewForm(false); }} onSetActive={setActive} onDuplicate={duplicate} busy={busy} renderEditor={(service) => <><div className="mb-5"><h3 className="text-base font-semibold">Edit service</h3><p className="mt-1 text-sm text-muted-foreground">Update this service without leaving its card.</p></div><ServiceForm key={service.id} initialService={service} onCancel={closeEditor} onSubmit={save} /></>} />
    {showNewForm && <Card><CardHeader><CardTitle>Add service</CardTitle></CardHeader><CardContent><ServiceForm key="new" onCancel={closeEditor} onSubmit={save} /></CardContent></Card>}
  </>;
}
