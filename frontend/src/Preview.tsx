import type { ResumeDocument } from "./types";

export function Preview({ document }: { document: ResumeDocument }) {
  const { basics, sections, presentation } = document;
  return (
    <article
      className={`preview ${presentation.template}`}
      style={{ "--accent": presentation.accent } as React.CSSProperties}
    >
      <header className="preview-header">
        <h2>{basics.name || "Your name"}</h2>
        {basics.headline && <h3>{basics.headline}</h3>}
        <div className="preview-contact">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location && <span>{basics.location}</span>}
        </div>
        {basics.summary && <p className="preview-summary">{basics.summary}</p>}
      </header>
      {[...sections]
        .filter((section) => section.visible)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <section className="preview-section" key={section.id}>
            <h4>{section.title}</h4>
            {[...section.items]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div className="preview-item" key={item.id}>
                  <div className="preview-item-heading">
                    <div>
                      {item.title && <strong>{item.title}</strong>}
                      {item.subtitle && <span>{item.subtitle}</span>}
                    </div>
                    {(item.start_date || item.end_date) && (
                      <time>
                        {item.start_date}
                        {item.start_date && item.end_date ? " – " : ""}
                        {item.end_date}
                      </time>
                    )}
                  </div>
                  {item.description && <p>{item.description}</p>}
                </div>
              ))}
          </section>
        ))}
    </article>
  );
}
