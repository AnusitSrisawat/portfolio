const d = window.PORTFOLIO;

function el(tag, props = {}, children = []) {
  const e = Object.assign(document.createElement(tag), props);
  children.forEach((c) => e.append(c));
  return e;
}

document.title = `${d.name} · Portfolio`;
document.getElementById("name").textContent = d.name;
document.getElementById("role").textContent = d.title;
document.getElementById("bio").textContent = d.bio;

const contacts = document.getElementById("contacts");
d.contacts.forEach((c) =>
  contacts.append(el("a", { href: c.url, textContent: c.label, target: "_blank", rel: "noopener" }))
);

const grid = document.getElementById("skills");
const filters = document.getElementById("filters");

function renderSkills(active) {
  grid.replaceChildren();
  d.skills
    .filter((s) => active === "all" || s.name === active)
    .forEach((s) => {
      const links = s.projects.map((p) =>
        el("li", {}, [
          el("a", { href: p.url, textContent: p.title, target: "_blank", rel: "noopener" }),
          ...(p.note ? [el("span", { className: "note", textContent: ` — ${p.note}` })] : [])
        ])
      );
      const dots = s.level
        ? el("div", { className: "level", title: `${s.level}/5` }, [
            "●".repeat(s.level) + "○".repeat(5 - s.level)
          ])
        : "";
      grid.append(
        el("article", { className: "card" }, [
          el("h3", {}, [`${s.icon || ""} ${s.name}`]),
          dots,
          el("p", { textContent: s.description }),
          el("ul", {}, links)
        ])
      );
    });
}

["all", ...d.skills.map((s) => s.name)].forEach((name) => {
  const b = el("button", { textContent: name === "all" ? "ทั้งหมด" : name });
  b.addEventListener("click", () => {
    filters.querySelectorAll("button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    renderSkills(name);
  });
  if (name === "all") b.classList.add("on");
  filters.append(b);
});

renderSkills("all");
