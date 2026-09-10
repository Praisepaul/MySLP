"use client";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, Clock3, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AvailabilityException } from "@/lib/config/availability";

interface Props { exceptions: AvailabilityException[]; editingId?: string; onEdit?: (item: AvailabilityException) => void; onDelete?: (id: string) => void; renderEditor?: (item: AvailabilityException) => React.ReactNode; busy?: boolean; }
function formatDate(value:string){const d=new Date(`${value}T00:00:00`);return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("en",{weekday:"long",month:"short",day:"numeric",year:"numeric"}).format(d)}
function formatTime(value:string){const [h,m]=value.split(":").map(Number);if(Number.isNaN(h)||Number.isNaN(m))return value;const d=new Date();d.setHours(h,m,0,0);return new Intl.DateTimeFormat("en",{hour:"numeric",minute:"2-digit"}).format(d)}

export function AvailabilityExceptionsListV2({exceptions,editingId,onEdit,onDelete,renderEditor,busy}:Props){
  const [openId,setOpenId]=useState<string|null>(null);
  const menuRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    if(!openId)return;
    const close=(event:PointerEvent)=>{
      const target=event.target;
      if(target instanceof Node && menuRef.current?.contains(target))return;
      setOpenId(null);
    };
    document.addEventListener("pointerdown",close);
    return()=>document.removeEventListener("pointerdown",close);
  },[openId]);

  const sorted=[...exceptions].sort((a,b)=>a.date.localeCompare(b.date));
  if(!sorted.length)return <Card><CardContent className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-muted"><CalendarDays className="size-5 text-muted-foreground"/></div><h3 className="mt-4 text-base font-semibold">No availability exceptions</h3><p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">Add an exception when you need to block a date or use different hours from your normal weekly schedule.</p></CardContent></Card>;

  return <div className="space-y-4">{sorted.map(item=>{const menu=openId===item.id;return <Card key={item.id} className="overflow-visible"><CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><CardTitle className="text-lg">{formatDate(item.date)}</CardTitle><Badge variant={item.type==="unavailable"?"destructive":"secondary"}>{item.type==="unavailable"?"Unavailable":"Custom hours"}</Badge></div>{item.reason&&<p className="mt-2 text-sm leading-6 text-muted-foreground">{item.reason}</p>}</div><div ref={menu?menuRef:undefined} className="relative shrink-0"><Button type="button" variant="ghost" size="icon" aria-label={`More actions for ${formatDate(item.date)}`} aria-expanded={menu} onClick={()=>setOpenId(menu?null:item.id)}><MoreHorizontal className="size-4"/></Button>{menu&&<div role="menu" className="absolute right-0 z-50 mt-2 w-36 rounded-xl border bg-background p-1 shadow-lg"><button type="button" role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50" disabled={busy} onClick={()=>{setOpenId(null);onEdit?.(item)}}>Edit</button><button type="button" role="menuitem" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-muted disabled:opacity-50" disabled={busy} onClick={()=>{setOpenId(null);onDelete?.(item.id)}}>Delete</button></div>}</div></CardHeader><CardContent>{item.type==="unavailable"?<div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4"/>Entire day unavailable</div>:<div className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4"/>{item.startTime&&item.endTime?`${formatTime(item.startTime)} – ${formatTime(item.endTime)}`:"Custom hours"}</div>}</CardContent>{editingId===item.id&&renderEditor&&<CardContent className="border-t pt-6">{renderEditor(item)}</CardContent>}</Card>})}</div>;
}
