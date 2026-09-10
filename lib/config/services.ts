export type Service = {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    durationMinutes: number;
    price?: number;
    currency?: string;
    online: boolean;
    inPerson: boolean;
    active: boolean;
    order: number;
};

export const services: Service[] = [
    {
        id: "initial-consultation",
        name: "Initial consultation",
        shortDescription:
            "A focused first conversation to understand your goals and discuss the right next step.",
        description:
            "An initial consultation provides an opportunity to understand your communication needs, discuss your goals and determine the most appropriate next steps.",
        durationMinutes: 60,
        online: true,
        inPerson: false,
        active: true,
        order: 1,
    },
    {
        id: "speech-language-session",
        name: "Speech & language session",
        shortDescription:
            "Personalised support shaped around the communication skills you want to develop.",
        description:
            "A personalised speech and language session focused on the goals and communication skills that matter most to you.",
        durationMinutes: 50,
        online: true,
        inPerson: false,
        active: true,
        order: 2,
    },
    {
        id: "follow-up-session",
        name: "Follow-up session",
        shortDescription:
            "Ongoing support to review progress, practise strategies and adjust your plan as needed.",
        description:
            "A follow-up session to review progress, practise strategies and adapt your support plan based on your needs.",
        durationMinutes: 50,
        online: true,
        inPerson: false,
        active: true,
        order: 3,
    },
];
