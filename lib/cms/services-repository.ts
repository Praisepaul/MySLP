import { getMongoDb } from "@/lib/db/mongodb";
import { services as defaultServices, type Service } from "@/lib/config/services";

const collectionName = "cms_services";

function normalizeService(service: Service): Service {
  return {
    ...service,
    id: service.id.trim(),
    name: service.name.trim(),
    shortDescription: service.shortDescription.trim(),
    description: service.description.trim(),
    durationMinutes: Math.round(Number(service.durationMinutes)),
    price: service.price === undefined ? undefined : Number(service.price),
    currency: service.currency?.trim().toUpperCase() || undefined,
    order: Math.max(1, Math.round(Number(service.order))),
  };
}

function validateService(service: Service): string | null {
  if (!service.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(service.id)) return "Service id must use lowercase letters, numbers and hyphens.";
  if (!service.name) return "Please enter a service name.";
  if (service.name.length > 160) return "Service name must be 160 characters or fewer.";
  if (!service.shortDescription) return "Please enter a short description.";
  if (service.shortDescription.length > 500) return "Short description must be 500 characters or fewer.";
  if (!service.description) return "Please enter a description.";
  if (service.description.length > 5000) return "Description must be 5,000 characters or fewer.";
  if (!Number.isInteger(service.durationMinutes) || service.durationMinutes < 1 || service.durationMinutes > 1440) return "Duration must be between 1 and 1,440 minutes.";
  if (service.price !== undefined && (!Number.isFinite(service.price) || service.price < 0)) return "Price must be a valid non-negative number.";
  if (service.currency && !/^[A-Z]{3}$/.test(service.currency)) return "Currency must be a 3-letter code.";
  if (service.online !== true && service.inPerson !== true) return "Enable at least one appointment type.";
  return null;
}

export async function getServices(): Promise<Service[]> {
  const documents = await (await getMongoDb()).collection<Service>(collectionName).find({}).sort({ order: 1, name: 1 }).toArray();
  return documents.length ? documents.map(normalizeService) : defaultServices.map(normalizeService);
}

export async function saveServices(value: Service[]): Promise<Service[]> {
  if (!Array.isArray(value) || value.length > 100) throw new Error("Invalid services.");
  const normalized = value.map(normalizeService);
  const ids = new Set<string>();
  for (const service of normalized) {
    if (ids.has(service.id)) throw new Error("Each service must have a unique id.");
    ids.add(service.id);
    const error = validateService(service);
    if (error) throw new Error(error);
  }
  const collection = (await getMongoDb()).collection<Service>(collectionName);
  await collection.deleteMany({});
  if (normalized.length) await collection.insertMany(normalized);
  return normalized.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export async function upsertService(service: Service): Promise<Service[]> {
  const current = await getServices();
  const normalized = normalizeService(service);
  const existingIndex = current.findIndex((item) => item.id === normalized.id);
  if (existingIndex >= 0) current[existingIndex] = normalized;
  else current.push(normalized);
  return saveServices(current);
}

export async function disableService(id: string): Promise<Service[]> {
  const current = await getServices();
  const service = current.find((item) => item.id === id);
  if (!service) throw new Error("Service not found.");
  service.active = false;
  return saveServices(current);
}

export async function deleteService(id: string): Promise<Service[]> {
  const current = await getServices();
  const next = current.filter((item) => item.id !== id);
  if (next.length === current.length) throw new Error("Service not found.");
  return saveServices(next);
}
