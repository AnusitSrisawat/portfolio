"use client";

import { useEffect, useId, useState, useTransition } from "react";
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners,
  useDroppable, useSensor, useSensors,
  type DragEndEvent, type DragOverEvent, type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionForm } from "@/components/ActionForm";
import type { Layout } from "@/lib/actions";

export type BoardColumn = { key: string; categoryId: number | null; name: string; skills: { id: number; name: string }[] };

type Props = {
  columns: BoardColumn[];
  save: (layout: Layout) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
};

type Items = Record<string, number[]>;

const toItems = (cols: BoardColumn[]): Items =>
  Object.fromEntries(cols.map((c) => [c.key, c.skills.map((s) => s.id)]));

function Row({ id, name, deleteAction, overlay }: { id: number; name: string; deleteAction: Props["deleteAction"]; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : { transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-2 py-1.5 ${
        isDragging && !overlay ? "opacity-30" : ""
      } ${overlay ? "shadow-xl" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none select-none rounded px-1 text-lg leading-none active:cursor-grabbing"
        aria-label={`Drag ${name}`}
        {...(overlay ? {} : { ...attributes, ...listeners })}
      >
        ⠿
      </button>
      <span className="flex-1 truncate font-semibold">{name}</span>
      {!overlay && (
        <ActionForm
          action={deleteAction}
          pendingText="Deleting…"
          successText="Deleted"
          confirm={{ title: `Delete “${name}”?`, body: "Linked projects are kept, just unlinked.", label: "Delete", danger: true }}
        >
          <input type="hidden" name="id" value={id} />
          <button className="rounded-full px-2 text-sm text-red-600 hover:bg-red-100" aria-label={`Delete ${name}`}>✕</button>
        </ActionForm>
      )}
    </div>
  );
}

function Column({ col, ids, names, deleteAction }: { col: BoardColumn; ids: number[]; names: Map<number, string>; deleteAction: Props["deleteAction"] }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-24 space-y-2 rounded-2xl border-2 border-dashed p-3 transition-colors ${
        isOver ? "border-amber-deep bg-amber/20" : "border-ink/30 bg-cream"
      }`}
    >
      <h3 className="text-xs font-bold uppercase tracking-wide opacity-60">{col.name}</h3>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {ids.map((id) => (
          <Row key={id} id={id} name={names.get(id) ?? ""} deleteAction={deleteAction} />
        ))}
      </SortableContext>
      {ids.length === 0 && <p className="py-2 text-center text-xs opacity-50">Drop skills here</p>}
    </div>
  );
}

export function SkillBoard({ columns, save, deleteAction }: Props) {
  const dndId = useId();
  const [items, setItems] = useState<Items>(() => toItems(columns));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  // Re-sync when the server data changes (skill added/deleted/edited elsewhere).
  const serverSig = JSON.stringify(toItems(columns));
  useEffect(() => {
    setItems(JSON.parse(serverSig));
  }, [serverSig]);

  useEffect(() => {
    if (status === "idle") return;
    const t = setTimeout(() => setStatus("idle"), status === "error" ? 4000 : 1500);
    return () => clearTimeout(t);
  }, [status]);

  const names = new Map(columns.flatMap((c) => c.skills.map((s) => [s.id, s.name] as const)));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findKey = (id: number | string, from: Items = items) =>
    typeof id === "string" ? (id in from ? id : undefined) : Object.keys(from).find((k) => from[k].includes(id));

  function onDragStart(e: DragStartEvent) {
    setActiveId(Number(e.active.id));
  }

  // Move the card into the hovered column while dragging, so the list previews the drop.
  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = findKey(Number(active.id));
    const to = findKey(over.id as number | string);
    if (!from || !to || from === to) return;
    setItems((prev) => {
      const fromList = prev[from].filter((i) => i !== active.id);
      const toList = [...prev[to]];
      const overIndex = typeof over.id === "number" ? toList.indexOf(over.id) : -1;
      toList.splice(overIndex >= 0 ? overIndex : toList.length, 0, Number(active.id));
      return { ...prev, [from]: fromList, [to]: toList };
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    let next = items;
    if (over) {
      const from = findKey(Number(active.id));
      const to = findKey(over.id as number | string);
      if (from && to && from === to && typeof over.id === "number") {
        const oldIndex = items[from].indexOf(Number(active.id));
        const newIndex = items[from].indexOf(over.id);
        if (oldIndex !== newIndex) {
          next = { ...items, [from]: arrayMove(items[from], oldIndex, newIndex) };
          setItems(next);
        }
      }
    }
    if (JSON.stringify(next) === serverSig) return; // nothing changed
    const layout: Layout = columns.map((c) => ({ categoryId: c.categoryId, skillIds: next[c.key] ?? [] }));
    setStatus("idle");
    startTransition(async () => {
      try {
        await save(layout);
        setStatus("saved");
      } catch {
        setStatus("error");
        setItems(JSON.parse(serverSig)); // roll back
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm opacity-70">Drag ⠿ to reorder, or drop a skill into another category.</p>
        <span className="min-h-6 text-sm font-semibold" role="status" aria-live="polite">
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-[3px] border-ink/20 border-t-amber-deep" />
              Saving…
            </span>
          ) : status === "saved" ? (
            "✓ Order saved"
          ) : status === "error" ? (
            <span className="text-red-600">Couldn&apos;t save — reverted</span>
          ) : null}
        </span>
      </div>
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          setItems(JSON.parse(serverSig));
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {columns.map((c) => (
            <Column key={c.key} col={c} ids={items[c.key] ?? []} names={names} deleteAction={deleteAction} />
          ))}
        </div>
        <DragOverlay>
          {activeId !== null && <Row id={activeId} name={names.get(activeId) ?? ""} deleteAction={deleteAction} overlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
