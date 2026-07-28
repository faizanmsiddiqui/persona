import type { ResumeDocument } from "./types";

export function Preview({ document }: { document: ResumeDocument }) {
  const { basics, sections, presentation } = document;
  return (
    <article
      className={`preview ${presentation.template}`}
      style={{ "--accent": presentation.accent } as React.CSSProperties}
    >
      <h2>{basics.name || "Your name"}</h2>
      <h3>{basics.headline}</h3>
      <p>{basics.summary}</p>
      {sections
        .filter((section) => section.visible)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <section key={section.id}>
            <h4>{section.title}</h4>
            {section.items
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                  <p>{item.description}</p>
                </div>
              ))}
          </section>
        ))}
    </article>
  );
}
