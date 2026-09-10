import type { Collection } from "mongodb";
import { getMongoDb } from "@/lib/db/mongodb";
import { bookingSettings, type BookingSettings, validateBookingSettings } from "@/lib/config/booking-settings";
import { therapistProfile, type TherapistProfile } from "@/lib/config/therapist-profile";

const collectionName = "site_settings";
const profileId = "therapist-profile";
const bookingSettingsId = "booking-settings";

type StoredDocument<T> = {
  _id: string;
  value: T;
  updatedAt: Date;
};

export type EditableTherapistProfile = {
  name: string;
  professionalTitle: string;
  shortBio: string;
  longBio: string;
  credentials: string[];
  languages: string[];
  location: string;
  timezone: string;
  acceptsOnlineAppointments: boolean;
  acceptsInPersonAppointments: boolean;
  profileImage: string;
  contact: { email: string; phone: string };
  socialLinks: { website: string; instagram: string; linkedin: string };
};

export type EditableBookingSettings = BookingSettings & {
  cancellationPolicy: string;
  reschedulingPolicy: string;
  bookingInstructions: string;
};

const defaultProfile: EditableTherapistProfile = {
  name: therapistProfile.name,
  professionalTitle: therapistProfile.professionalTitle,
  shortBio: therapistProfile.shortBio,
  longBio: therapistProfile.longBio,
  credentials: [...therapistProfile.credentials],
  languages: [...therapistProfile.languages],
  location: therapistProfile.location,
  timezone: therapistProfile.timezone,
  acceptsOnlineAppointments: therapistProfile.acceptsOnlineAppointments,
  acceptsInPersonAppointments: therapistProfile.acceptsInPersonAppointments,
  profileImage: therapistProfile.profileImage,
  contact: { ...therapistProfile.contact },
  socialLinks: { ...therapistProfile.socialLinks },
};

export const defaultBookingSettings: EditableBookingSettings = {
  ...bookingSettings,
  cancellationPolicy: "",
  reschedulingPolicy: "",
  bookingInstructions: "",
};

async function getCollection(): Promise<Collection<StoredDocument<unknown>>> {
  return (await getMongoDb()).collection<StoredDocument<unknown>>(collectionName);
}

function normalizeProfile(value: EditableTherapistProfile): EditableTherapistProfile {
  return {
    ...value,
    name: value.name.trim(),
    professionalTitle: value.professionalTitle.trim(),
    shortBio: value.shortBio.trim(),
    longBio: value.longBio.trim(),
    credentials: value.credentials.map((item) => item.trim()).filter(Boolean),
    languages: value.languages.map((item) => item.trim()).filter(Boolean),
    location: value.location.trim(),
    timezone: value.timezone.trim(),
    profileImage: value.profileImage.trim(),
    contact: { email: value.contact.email.trim(), phone: value.contact.phone.trim() },
    socialLinks: {
      website: value.socialLinks.website.trim(),
      instagram: value.socialLinks.instagram.trim(),
      linkedin: value.socialLinks.linkedin.trim(),
    },
  };
}

function validateProfile(profile: EditableTherapistProfile): string | null {
  if (!profile.professionalTitle) return "Please enter a professional title.";
  if (profile.shortBio.length > 500) return "Short bio must be 500 characters or fewer.";
  if (profile.longBio.length > 5000) return "Long bio must be 5,000 characters or fewer.";
  if (profile.location.length > 200) return "Location must be 200 characters or fewer.";
  if (profile.timezone) {
    try { new Intl.DateTimeFormat("en-US", { timeZone: profile.timezone }).format(); } catch { return "Please provide a valid IANA timezone."; }
  }
  if (profile.contact.email && !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(profile.contact.email)) return "Please provide a valid email address.";
  return null;
}

function normalizeBookingSettings(value: EditableBookingSettings): EditableBookingSettings {
  return {
    ...value,
    cancellationPolicy: value.cancellationPolicy.trim(),
    reschedulingPolicy: value.reschedulingPolicy.trim(),
    bookingInstructions: value.bookingInstructions.trim(),
  };
}

export async function getTherapistProfile(): Promise<EditableTherapistProfile> {
  const document = await (await getCollection()).findOne({ _id: profileId }) as StoredDocument<EditableTherapistProfile> | null;
  return document?.value ? normalizeProfile(document.value) : defaultProfile;
}

export async function saveTherapistProfile(value: EditableTherapistProfile): Promise<EditableTherapistProfile> {
  const profile = normalizeProfile(value);
  const error = validateProfile(profile);
  if (error) throw new Error(error);
  await (await getCollection()).updateOne({ _id: profileId }, { $set: { value: profile, updatedAt: new Date() } }, { upsert: true });
  return profile;
}

export async function getBookingSettings(): Promise<EditableBookingSettings> {
  const document = await (await getCollection()).findOne({ _id: bookingSettingsId }) as StoredDocument<EditableBookingSettings> | null;
  return document?.value ? normalizeBookingSettings(document.value) : defaultBookingSettings;
}

export async function saveBookingSettings(value: EditableBookingSettings): Promise<EditableBookingSettings> {
  const settings = normalizeBookingSettings(value);
  const validationError = validateBookingSettings(settings);
  if (validationError) throw new Error(validationError);
  if (settings.cancellationPolicy.length > 5000 || settings.reschedulingPolicy.length > 5000 || settings.bookingInstructions.length > 5000) throw new Error("Policy and instruction fields must be 5,000 characters or fewer.");
  await (await getCollection()).updateOne({ _id: bookingSettingsId }, { $set: { value: settings, updatedAt: new Date() } }, { upsert: true });
  return settings;
}
