"use client";

import { useEffect, useRef, useState } from "react";
import { Clock3, Globe2, MapPin, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/lib/config/services";

interface ServicesListProps {
  services: Service[];
  editingId?: string;
  onEdit?: (service: Service) => void;
  onSetActive?: (id: string, active: boolean) => void;
  onDuplicate?: (service: Service) => void;
  renderEditor?: (service: Service) => React.ReactNode;
  busy?: boolean;
}

function getDeliveryLabel(service: Service) {
  if (service.online && service.inPerson) return "Online & in person";
  if (service.online) return "Online";
  if (service.inPerson) return "In person";
  return "Not specified";
}

export function ServicesList({ services, editingId, onEdit, onSetActive, onDuplicate, renderEditor, busy }: ServicesListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openId) return;
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpenId(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [openId]);

  const sortedServices = [...services].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedServices.map((service) => {
        const menuOpen = openId === service.id;
        return (
          <Card key={service.id} className="overflow-visible">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge variant={service.active ? "default" : "secondary"}>{service.active ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.shortDescription}</p>
              </div>
              <div ref={menuOpen ? menuRef : undefined} className="relative shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`More actions for ${service.name}`}
                  aria-expanded={menuOpen}
                  onClick={() => setOpenId(menuOpen ? null : service.id)}
                >
                  <MoreHorizontal aria-hidden="true" className="size-4" />
                </Button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 z-50 mt-2 w-44 rounded-xl border bg-background p-1 shadow-lg">
                    <button type="button" role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50" disabled={busy} onClick={() => { setOpenId(null); onEdit?.(service); }}>Edit</button>
                    <button type="button" role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50" disabled={busy} onClick={() => { setOpenId(null); onDuplicate?.(service); }}>Duplicate</button>
                    <button type="button" role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50" disabled={busy} onClick={() => { setOpenId(null); onSetActive?.(service.id, !service.active); }}>{service.active ? "Disable" : "Enable"}</button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4" />{service.durationMinutes} minutes</span>
                <span className="inline-flex items-center gap-2">{service.online && !service.inPerson ? <Globe2 aria-hidden="true" className="size-4" /> : <MapPin aria-hidden="true" className="size-4" />}{getDeliveryLabel(service)}</span>
                <span>Order {service.order}</span>
                {service.price !== undefined && <span>{service.currency ?? "USD"} {service.price}</span>}
              </div>
            </CardContent>
            {editingId === service.id && renderEditor && <CardContent className="border-t pt-6">{renderEditor(service)}</CardContent>}
          </Card>
        );
      })}
    </div>
  );
}
