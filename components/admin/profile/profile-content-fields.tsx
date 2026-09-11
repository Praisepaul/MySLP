"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileFaqItem, ProfileResource, ProfileTestimonial } from "@/lib/cms/site-settings-repository";

export function ProfileTestimonialsField({ value, onChange }: { value: ProfileTestimonial[]; onChange: (value: ProfileTestimonial[]) => void }) {
  const empty = { quote: "", name: "", context: "" };
  return <EntryEditor label="Testimonials" description="Add one at a time. Saved testimonials appear as cards below and can be edited or removed." addLabel="Add testimonial" value={value} empty={empty} onChange={onChange} renderDraft={(draft, setDraft) => <div className="grid gap-3"><Textarea value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} placeholder="What would you like to share?" maxLength={2000} /><div className="grid gap-3 sm:grid-cols-2"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name (optional)" maxLength={200} /><Input value={draft.context} onChange={(e) => setDraft({ ...draft, context: e.target.value })} placeholder="Context, e.g. Parent of a client (optional)" maxLength={300} /></div></div>} renderSaved={(item) => <><p className="text-sm leading-6">“{item.quote}”</p>{(item.name || item.context) && <p className="mt-2 text-xs text-muted-foreground">{[item.name, item.context].filter(Boolean).join(" · ")}</p>}</>} />;
}

export function ProfileFaqsField({ value, onChange }: { value: ProfileFaqItem[]; onChange: (value: ProfileFaqItem[]) => void }) {
  const empty = { question: "", answer: "" };
  return <EntryEditor label="Frequently asked questions" description="Add one question at a time. Each saved FAQ becomes a clean expandable section on the website." addLabel="Add FAQ" value={value} empty={empty} onChange={onChange} renderDraft={(draft, setDraft) => <div className="grid gap-3"><Input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="Question" maxLength={300} /><Textarea value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} placeholder="Answer" maxLength={3000} /></div>} renderSaved={(item) => <><p className="font-medium">{item.question}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p></>} />;
}

export function ProfileResourcesField({ value, onChange }: { value: ProfileResource[]; onChange: (value: ProfileResource[]) => void }) {
  const empty = { title: "", description: "", url: "" };
  return <EntryEditor label="Resources & articles" description="Add one resource at a time. Each saved item becomes a clickable card that opens its link in a new tab." addLabel="Add resource" value={value} empty={empty} onChange={onChange} renderDraft={(draft, setDraft) => <div className="grid gap-3"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Resource or article title" maxLength={200} /><Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Short description (optional)" maxLength={1000} /><Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" maxLength={1000} /></div>} renderSaved={(item) => <><p className="font-medium">{item.title}</p>{item.description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>}{item.url && <p className="mt-2 truncate text-xs text-muted-foreground">{item.url}</p>}</>} />;
}

function EntryEditor<T extends object>({ label, description, addLabel, value, empty, onChange, renderDraft, renderSaved }: { label: string; description: string; addLabel: string; value: T[]; empty: T; onChange: (value: T[]) => void; renderDraft: (draft: T, setDraft: (draft: T) => void) => React.ReactNode; renderSaved: (item: T) => React.ReactNode }) {
  const [draft, setDraft] = React.useState<T>(empty);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  function reset() { setDraft({ ...empty }); setEditingIndex(null); }
  function saveEntry() { const candidate = draft as Record<string, string>; if (!Object.values(candidate).some((item) => item.trim())) return; const next = [...value]; if (editingIndex === null) next.push(draft); else next[editingIndex] = draft; onChange(next); reset(); }
  function edit(index: number) { setEditingIndex(index); setDraft({ ...value[index] }); }
  return <div className="space-y-4"><div><Label>{label}</Label><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><div className="rounded-2xl border bg-muted/20 p-4">{renderDraft(draft, setDraft)}<div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" onClick={saveEntry}><Plus /> {editingIndex === null ? addLabel : "Save changes"}</Button>{editingIndex !== null && <Button type="button" size="sm" variant="ghost" onClick={reset}><X /> Cancel</Button>}</div></div>{value.length > 0 && <div className="grid gap-3">{value.map((item, index) => <div key={index} className="rounded-2xl border bg-card p-4"><div className="min-w-0">{renderSaved(item)}</div><div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => edit(index)}><Pencil /> Edit</Button><Button type="button" size="sm" variant="ghost" onClick={() => { if (editingIndex === index) reset(); onChange(value.filter((_, itemIndex) => itemIndex !== index)); }}><Trash2 /> Remove</Button></div></div>)}</div>}</div>;
}
