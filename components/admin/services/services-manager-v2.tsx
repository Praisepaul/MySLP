"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceForm } from "@/components/admin/services/service-form";
import { ServicesList } from "@/components/admin/services/services-list";
import type { Service } from "@/lib/config/services";

function slugifyServiceName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function createServiceId(name: string, existing: Service[]) {
  const base = slugifyServiceName(name);
  if (!base) return "service";
  const existingIds = new Set(existing.map((service) => service.id));
  if (!existingIds.has(base)) return base;
  let index = 2;
  while (existingIds.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

export function ServicesManagerV2({ initialServices }: { initialServices: Service[] }) {
  const [items, setItems] = useState(initialServices);
  const [editing, setEditing] = useState<Service | undefined>();
  const [showNewForm, setShowNewForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const newFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showNewForm) return;
    requestAnimationFrame(() => newFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [showNewForm]);

  async function save(service: Service) {
    setBusy(true);
    setError("");
    try {
      const serviceToSave = service.id ? service : { ...service, id: createServiceId(service.name, items) };
      const response = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceToSave),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Couldn't save service.");
      setItems(data.services);
      setEditing(undefined);
      setShowNewForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save service.");
    } finally {
      setBusy(false);
    }
  }

  async function setActive(id: string, active: boolean) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Couldn't update service.");
      setItems(data.services);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update service.");
    } finally {
      setBusy(false);
    }
  }

  function duplicate(service: Service) {
    const copy = {
      ...service,
      id: createServiceId(`${service.name} copy`, items),
      name: `${service.name} (copy)`,
      order: Math.max(...items.map((item) => item.order), 0) + 1,
    };
    setEditing(copy);
    setShowNewForm(false);
  }

  function closeEditor() {
    setEditing(undefined);
    setShowNewForm(false);
  }

  return (
    <>
      <div className="flex justify-end">
        <Button type="button" onClick={() => { setEditing(undefined); setShowNewForm(true); }}>
          <Plus aria-hidden="true" className="size-4" />Add service
        </Button>
      </div>
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
      <ServicesList
        services={items}
        editingId={editing?.id}
        onEdit={(service) => { setEditing(service); setShowNewForm(false); }}
        onSetActive={setActive}
        onDuplicate={duplicate}
        busy={busy}
        renderEditor={(service) => (
          <>
            <div className="mb-5">
              <h3 className="text-base font-semibold">Edit service</h3>
              <p className="mt-1 text-sm text-muted-foreground">Update this service without leaving its card.</p>
            </div>
            <ServiceForm key={service.id} initialService={service} onCancel={closeEditor} onSubmit={save} />
          </>
        )}
      />
      {showNewForm && (
        <div ref={newFormRef} className="scroll-mt-24">
          <Card>
            <CardHeader><CardTitle>Add service</CardTitle></CardHeader>
            <CardContent><ServiceForm key="new" onCancel={closeEditor} onSubmit={save} /></CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
