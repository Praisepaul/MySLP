"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileFaqItem, ProfileResource, ProfileTestimonial } from "@/lib/cms/site-settings-repository";

export function ProfileTestimonialsField({ value, onChange }: { value: ProfileTestimonial[]; onChange: (value: ProfileTestimonial[]) => void }) {
  function add() { onChange([...value, { quote: "", name: "", context: "" }]); }
  function update(index: number, patch: Partial<ProfileTestimonial>) { onChange(value.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)); }
  return <div className="space-y-4"><div className="flex items-center justify-between gap-4"><div><Label>Testimonials</Label><p className="mt-1 text-xs text-muted-foreground">Optional patient/client feedback. Only completed testimonials are shown publicly.</p></div><Button type="button" variant="outline" size="sm" onClick={add}><Plus /> Add testimonial</Button></div>{value.map((item, index) => <div key={index} className="space-y-3 rounded-2xl border p-4"><Textarea value={item.quote} onChange={(event) => update(index, { quote: event.target.value })} placeholder="What would you like to share?" maxLength={2000} /><div className="grid gap-3 sm:grid-cols-2"><Input value={item.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="Name (optional)" maxLength={200} /><Input value={item.context} onChange={(event) => update(index, { context: event.target.value })} placeholder="Context, e.g. Parent of a client (optional)" maxLength={300} /></div><Button type="button" variant="ghost" size="sm" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /> Remove</Button></div>)}</div>;
}

export function ProfileFaqsField({ value, onChange }: { value: ProfileFaqItem[]; onChange: (value: ProfileFaqItem[]) => void }) {
  function add() { onChange([...value, { question: "", answer: "" }]); }
  function update(index: number, patch: Partial<ProfileFaqItem>) { onChange(value.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)); }
  return <div className="space-y-4"><div className="flex items-center justify-between gap-4"><div><Label>Frequently asked questions</Label><p className="mt-1 text-xs text-muted-foreground">Add the questions patients ask most. They become the FAQ section automatically.</p></div><Button type="button" variant="outline" size="sm" onClick={add}><Plus /> Add FAQ</Button></div>{value.map((item, index) => <div key={index} className="space-y-3 rounded-2xl border p-4"><Input value={item.question} onChange={(event) => update(index, { question: event.target.value })} placeholder="Question" maxLength={300} /><Textarea value={item.answer} onChange={(event) => update(index, { answer: event.target.value })} placeholder="Answer" maxLength={3000} /><Button type="button" variant="ghost" size="sm" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /> Remove</Button></div>)}</div>;
}

export function ProfileResourcesField({ value, onChange }: { value: ProfileResource[]; onChange: (value: ProfileResource[]) => void }) {
  function add() { onChange([...value, { title: "", description: "", url: "" }]); }
  function update(index: number, patch: Partial<ProfileResource>) { onChange(value.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)); }
  return <div className="space-y-4"><div className="flex items-center justify-between gap-4"><div><Label>Resources &amp; articles</Label><p className="mt-1 text-xs text-muted-foreground">Optional resources you want patients to discover. They become clean cards with links.</p></div><Button type="button" variant="outline" size="sm" onClick={add}><Plus /> Add resource</Button></div>{value.map((item, index) => <div key={index} className="space-y-3 rounded-2xl border p-4"><Input value={item.title} onChange={(event) => update(index, { title: event.target.value })} placeholder="Resource title" maxLength={200} /><Textarea value={item.description} onChange={(event) => update(index, { description: event.target.value })} placeholder="Short description (optional)" maxLength={1000} /><Input value={item.url} onChange={(event) => update(index, { url: event.target.value })} placeholder="https://… (optional)" maxLength={1000} /><Button type="button" variant="ghost" size="sm" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /> Remove</Button></div>)}</div>;
}
