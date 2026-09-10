import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "Do I need an account to book?",
    answer: "No. The public booking experience is designed to work without creating a patient account.",
  },
  {
    question: "Can I book from another timezone?",
    answer: "Yes. Available times can be presented in your timezone, with the appointment stored consistently in UTC behind the scenes.",
  },
  {
    question: "How will I receive my appointment details?",
    answer: "After booking, you will receive the appointment information and calendar options available for your device.",
  },
  {
    question: "Are online sessions available?",
    answer: "Online appointments are supported. The final session details will explain how to join your appointment.",
  },
] as const;

export function ProfileFaq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t py-20 sm:py-24">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">FAQ</p>
          <h2 id="faq-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Questions, answered</h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-base leading-6">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
