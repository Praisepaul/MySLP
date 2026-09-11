import type { Collection } from "mongodb";
import { getMongoDb } from "@/lib/db/mongodb";
import { bookingSettings, type BookingSettings, validateBookingSettings } from "@/lib/config/booking-settings";
import { therapistProfile } from "@/lib/config/therapist-profile";

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
  educationQualifications: string[];
  professionalMemberships: string[];
  specialties: string[];
  ageGroups: string[];
  populations: string[];
  languages: string[];
  therapyApproach: string;
  firstSession: string;
  assessmentInfo: string;
  referralRequirements: string;
  accessibility: string;
  insurancePaymentInfo: string;
  whyIAmAnSlp: string;
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
  educationQualifications: [],
  professionalMemberships: [],
  specialties: [],
  ageGroups: [],
  populations: [],
  languages: [...therapistProfile.languages],
  therapyApproach: "",
  firstSession: "",
  assessmentInfo: "",
  referralRequirements: "",
  accessibility: "",
  insurancePaymentInfo: "",
  whyIAmAnSlp: "",
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

function cleanList(items: string[] | undefined): string[] {
  return (items ?? []).map((item) => item.trim()).filter(Boolean);
}

function normalizeProfile(value: EditableTherapistProfile): EditableTherapistProfile {
  return {
    ...defaultProfile,
    ...value,
    name: (value.name ?? "").trim(),
    professionalTitle: (value.professionalTitle ?? "").trim(),
    shortBio: (value.shortBio ?? "").trim(),
    longBio: (value.longBio ?? "").trim(),
    credentials: cleanList(value.credentials),
    educationQualifications: cleanList(value.educationQualifications),
    professionalMemberships: cleanList(value.professionalMemberships),
    specialties: cleanList(value.specialties),
    ageGroups: cleanList(value.ageGroups),
    populations: cleanList(value.populations),
    languages: cleanList(value.languages),
    therapyApproach: (value.therapyApproach ?? "").trim(),
    firstSession: (value.firstSession ?? "").trim(),
    assessmentInfo: (value.assessmentInfo ?? "").trim(),
    referralRequirements: (value.referralRequirements ?? "").trim(),
    accessibility: (value.accessibility ?? "").trim(),
    insurancePaymentInfo: (value.insurancePaymentInfo ?? "").trim(),
    whyIAmAnSlp: (value.whyIAmAnSlp ?? "").trim(),
    location: (value.location ?? "").trim(),
    timezone: (value.timezone ?? "").trim(),
    profileImage: (value.profileImage ?? "").trim(),
    contact: { email: (value.contact?.email ?? "").trim(), phone: (value.contact?.phone ?? "").trim() },
    socialLinks: {
      website: (value.socialLinks?.website ?? "").trim(),
      instagram: (value.socialLinks?.instagram ?? "").trim(),
      linkedin: (value.socialLinks?.linkedin ?? "").trim(),
    },
  };
}

function validateProfile(profile: EditableTherapistProfile): string | null {
  if (profile.shortBio.length > 500) return "Short bio must be 500 characters or fewer.";
  if (profile.longBio.length > 5000) return "About you must be 5,000 characters or fewer.";
  if (profile.therapyApproach.length > 3000 || profile.firstSession.length > 3000 || profile.assessmentInfo.length > 3000 || profile.referralRequirements.length > 2000 || profile.accessibility.length > 2000 || profile.insurancePaymentInfo.length > 2000 || profile.whyIAmAnSlp.length > 3000) return "One of the profile detail sections is too long.";
  if (profile.location.length > 200) return "Location must be 200 characters or fewer.";
  if (profile.timezone) {
    try { new Intl.DateTimeFormat("en-US", { timeZone: profile.timezone }).format(); } catch { return "Please provide a valid IANA timezone."; }
  }
  if (profile.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.contact.email)) return "Please provide a valid email address.";
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
