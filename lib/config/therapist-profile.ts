export const therapistProfile = {
  name: "",
  professionalTitle: "Speech-Language Pathologist",
  shortBio: "",
  longBio: "",
  credentials: [] as string[],
  languages: ["en", "pt", "hi"] as const,
  location: "",
  timezone: "",
  acceptsOnlineAppointments: true,
  acceptsInPersonAppointments: false,
  profileImage: "",
  contact: {
    email: "",
    phone: "",
  },
  socialLinks: {
    website: "",
    instagram: "",
    linkedin: "",
  },
} as const;

export type TherapistProfile = typeof therapistProfile;
