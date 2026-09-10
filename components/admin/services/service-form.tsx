"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/lib/config/services";

interface ServiceFormProps {
  initialService?: Service;
  onCancel?: () => void;
  onSubmit?: (service: Service) => void;
}

interface ServiceFormValues {
  name: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  price: string;
  currency: string;
  online: boolean;
  inPerson: boolean;
  active: boolean;
  order: number;
}

function getInitialValues(service?: Service): ServiceFormValues {
  return {
    name: service?.name ?? "",
    shortDescription: service?.shortDescription ?? "",
    description: service?.description ?? "",
    durationMinutes: service?.durationMinutes ?? 50,
    price: service?.price !== undefined ? String(service.price) : "",
    currency: service?.currency ?? "USD",
    online: service?.online ?? true,
    inPerson: service?.inPerson ?? false,
    active: service?.active ?? true,
    order: service?.order ?? 1,
  };
}

export function ServiceForm({
  initialService,
  onCancel,
  onSubmit,
}: ServiceFormProps) {
  const [values, setValues] = useState<ServiceFormValues>(
    getInitialValues(initialService),
  );

  function updateValue<K extends keyof ServiceFormValues>(
    field: K,
    value: ServiceFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const service: Service = {
      id: initialService?.id ?? "",
      name: values.name.trim(),
      shortDescription: values.shortDescription.trim(),
      description: values.description.trim(),
      durationMinutes: values.durationMinutes,
      ...(values.price.trim()
        ? { price: Number(values.price), currency: values.currency.trim() }
        : {}),
      online: values.online,
      inPerson: values.inPerson,
      active: values.active,
      order: values.order,
    };

    onSubmit?.(service);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="service-name">Service name</Label>
          <Input
            id="service-name"
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
            placeholder="Initial consultation"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="service-short-description">Short description</Label>
          <Textarea
            id="service-short-description"
            value={values.shortDescription}
            onChange={(event) =>
              updateValue("shortDescription", event.target.value)
            }
            placeholder="A brief description shown on service cards."
            rows={3}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="service-description">Description</Label>
          <Textarea
            id="service-description"
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            placeholder="Describe what this service includes."
            rows={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-duration">Duration (minutes)</Label>
          <Input
            id="service-duration"
            type="number"
            min={1}
            value={values.durationMinutes}
            onChange={(event) =>
              updateValue("durationMinutes", Number(event.target.value))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-order">Display order</Label>
          <Input
            id="service-order"
            type="number"
            min={1}
            value={values.order}
            onChange={(event) =>
              updateValue("order", Number(event.target.value))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-price">Price</Label>
          <Input
            id="service-price"
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(event) => updateValue("price", event.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-currency">Currency</Label>
          <Input
            id="service-currency"
            value={values.currency}
            onChange={(event) =>
              updateValue("currency", event.target.value.toUpperCase())
            }
            placeholder="USD"
            maxLength={3}
          />
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border p-5">
        <div>
          <h3 className="text-sm font-semibold">Availability</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how patients can attend this service.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="service-online">Online sessions</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Patients can attend remotely.
            </p>
          </div>
          <Switch
            id="service-online"
            checked={values.online}
            onCheckedChange={(checked) => updateValue("online", checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="service-in-person">In-person sessions</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Patients can attend at the practice location.
            </p>
          </div>
          <Switch
            id="service-in-person"
            checked={values.inPerson}
            onCheckedChange={(checked) => updateValue("inPerson", checked)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="service-active">Active service</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Active services can appear on the public website.
            </p>
          </div>
          <Switch
            id="service-active"
            checked={values.active}
            onCheckedChange={(checked) => updateValue("active", checked)}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {initialService ? "Save changes" : "Create service"}
        </Button>
      </div>
    </form>
  );
}
