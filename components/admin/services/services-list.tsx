"use client";

import { Clock3, Globe2, MapPin, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "@/lib/config/services";

interface ServicesListProps {
  services: Service[];
}

function getDeliveryLabel(service: Service) {
  if (service.online && service.inPerson) {
    return "Online & in person";
  }

  if (service.online) {
    return "Online";
  }

  if (service.inPerson) {
    return "In person";
  }

  return "Not specified";
}

export function ServicesList({ services }: ServicesListProps) {
  const sortedServices = [...services].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedServices.map((service) => (
        <Card key={service.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{service.name}</CardTitle>

                <Badge variant={service.active ? "default" : "secondary"}>
                  {service.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {service.shortDescription}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`More actions for ${service.name}`}
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4" />
                {service.durationMinutes} minutes
              </span>

              <span className="inline-flex items-center gap-2">
                {service.online && !service.inPerson ? (
                  <Globe2 aria-hidden="true" className="size-4" />
                ) : (
                  <MapPin aria-hidden="true" className="size-4" />
                )}
                {getDeliveryLabel(service)}
              </span>

              <span>Order {service.order}</span>

              {service.price !== undefined && (
                <span>
                  {service.currency ?? "USD"} {service.price}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
