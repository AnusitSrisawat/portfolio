"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Option = { id: number; title: string };

function Item({ option, onRemove }: { option: Option; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-xl border-2 border-ink bg-cream px-2 py-1 text-sm ${isDragging ? "opacity-40" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none select-none px-1 text-lg leading-none active:cursor-grabbing"
        aria-label={`Drag ${option.title}`}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <span className="flex-1 truncate font-medium">{option.title}</span>
      <button type="button" onClick={onRemove} className="rounded-full px-2 text-red-600 hover:bg-red-100" aria-label={`Remove ${option.title}`}>
        ✕
      </button>
    </li>
  );
}

/** Search-and-add picker; the selected list is orderable and submitted as ordered `projectIds` fields. */
export function ProjectPicker({ options, initial }: { options: Option[]; initial: number[] }) {
  const dndId = useId();
  const listId = useId();
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const [selected, setSelected] = useState<number[]>(() => initial.filter((id) => byId.has(id)));
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Re-sync if the server data changes (project deleted/renamed, saved elsewhere).
  const sig = JSON.stringify([initial, options]);
  useEffect(() => {
    setSelected(initial.filter((id) => byId.has(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const matches = options
    .filter((o) => !selected.includes(o.id) && o.title.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 8);

  function add(id: number) {
    setSelected((s) => (s.includes(id) ? s : [...s, id]));
    setQuery("");
    setActive(0);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault(); // never submit the surrounding form from the search box
      if (open && matches[active]) add(matches[active].id);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(matches.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function onDragEnd({ active: a, over }: DragEndEvent) {
    if (!over || a.id === over.id) return;
    setSelected((s) => arrayMove(s, s.indexOf(Number(a.id)), s.indexOf(Number(over.id))));
  }

  return (
    <div className="space-y-2">
      {selected.map((id) => (
        <input key={id} type="hidden" name="projectIds" value={id} />
      ))}

      <div ref={boxRef} className="relative">
        <input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={options.length ? "Search projects to add…" : "No projects yet"}
          disabled={options.length === 0}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="input"
        />
        {open && options.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border-2 border-ink bg-white p-1 shadow-lg"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-2 text-sm opacity-60">
                {query ? "No matching projects" : "All projects already added"}
              </li>
            ) : (
              matches.map((o, i) => (
                <li
                  key={o.id}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep focus in the input
                    add(o.id);
                  }}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${i === active ? "bg-amber" : ""}`}
                >
                  {o.title}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {selected.length > 0 ? (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={selected} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1.5">
              {selected.map((id) => (
                <Item key={id} option={byId.get(id)!} onRemove={() => setSelected((s) => s.filter((x) => x !== id))} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm opacity-60">No projects linked.</p>
      )}
      {selected.length > 1 && <p className="text-xs opacity-60">Drag ⠿ to set the order shown on the site.</p>}
    </div>
  );
}
