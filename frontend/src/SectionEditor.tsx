import type { Section, SectionItem, SectionKind } from "./types";

type SectionDefinition = {
  kind: SectionKind;
  title: string;
  itemLabel: string;
  titleLabel: string;
  subtitleLabel: string;
  descriptionLabel: string;
  dates: boolean;
};

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    kind: "experience",
    title: "Experience",
    itemLabel: "position",
    titleLabel: "Role",
    subtitleLabel: "Company",
    descriptionLabel: "Responsibilities and achievements",
    dates: true,
  },
  {
    kind: "education",
    title: "Education",
    itemLabel: "education",
    titleLabel: "Degree or qualification",
    subtitleLabel: "School or institution",
    descriptionLabel: "Details",
    dates: true,
  },
  {
    kind: "skills",
    title: "Skills",
    itemLabel: "skill",
    titleLabel: "Skill",
    subtitleLabel: "Level or category",
    descriptionLabel: "Supporting details",
    dates: false,
  },
  {
    kind: "projects",
    title: "Projects",
    itemLabel: "project",
    titleLabel: "Project name",
    subtitleLabel: "Role or link",
    descriptionLabel: "Project description",
    dates: true,
  },
  {
    kind: "certifications",
    title: "Certifications",
    itemLabel: "certification",
    titleLabel: "Certification",
    subtitleLabel: "Issuing organization",
    descriptionLabel: "Credential details",
    dates: true,
  },
  {
    kind: "languages",
    title: "Languages",
    itemLabel: "language",
    titleLabel: "Language",
    subtitleLabel: "Proficiency",
    descriptionLabel: "Additional details",
    dates: false,
  },
  {
    kind: "custom",
    title: "Additional information",
    itemLabel: "entry",
    titleLabel: "Title",
    subtitleLabel: "Subtitle",
    descriptionLabel: "Details",
    dates: false,
  },
];

function newItem(order: number): SectionItem {
  return {
    id: crypto.randomUUID(),
    order,
    title: "",
    subtitle: "",
    description: "",
    start_date: "",
    end_date: "",
  };
}

export function SectionEditor({
  sections,
  onChange,
  onMove,
}: {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  function addSection(kind: SectionKind) {
    const definition = SECTION_DEFINITIONS.find(
      (entry) => entry.kind === kind,
    )!;
    onChange([
      ...sections,
      {
        id: crypto.randomUUID(),
        kind,
        title: definition.title,
        order: sections.length,
        visible: true,
        items: [newItem(0)],
      },
    ]);
  }

  function updateSection(sectionId: string, update: Partial<Section>) {
    onChange(
      sections.map((section) =>
        section.id === sectionId ? { ...section, ...update } : section,
      ),
    );
  }

  function removeSection(sectionId: string) {
    onChange(
      sections
        .filter((section) => section.id !== sectionId)
        .map((section, order) => ({ ...section, order })),
    );
  }

  function updateItem(
    section: Section,
    itemId: string,
    update: Partial<SectionItem>,
  ) {
    updateSection(section.id, {
      items: section.items.map((item) =>
        item.id === itemId ? { ...item, ...update } : item,
      ),
    });
  }

  function removeItem(section: Section, itemId: string) {
    updateSection(section.id, {
      items: section.items
        .filter((item) => item.id !== itemId)
        .map((item, order) => ({ ...item, order })),
    });
  }

  return (
    <div className="section-builder">
      <div className="section-builder-heading">
        <h3>Résumé sections</h3>
        <label className="add-section">
          <span>Add section</span>
          <select
            value=""
            onChange={(event) => {
              if (event.target.value)
                addSection(event.target.value as SectionKind);
            }}
          >
            <option value="">Choose…</option>
            {SECTION_DEFINITIONS.map((definition) => (
              <option
                key={definition.kind}
                value={definition.kind}
                disabled={
                  definition.kind !== "custom" &&
                  sections.some((section) => section.kind === definition.kind)
                }
              >
                {definition.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sections.map((section, sectionIndex) => {
        const definition =
          SECTION_DEFINITIONS.find((entry) => entry.kind === section.kind) ??
          SECTION_DEFINITIONS.at(-1)!;
        return (
          <fieldset className="resume-section" key={section.id}>
            <legend>{definition.title}</legend>
            <div className="section-controls">
              <label>
                Section heading
                <input
                  value={section.title}
                  onChange={(event) =>
                    updateSection(section.id, { title: event.target.value })
                  }
                />
              </label>
              <label className="visibility-control">
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={(event) =>
                    updateSection(section.id, { visible: event.target.checked })
                  }
                />{" "}
                Show in résumé
              </label>
              <div className="section-buttons">
                <button
                  type="button"
                  disabled={sectionIndex === 0}
                  onClick={() => onMove(sectionIndex, -1)}
                  aria-label={`Move ${section.title} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={sectionIndex === sections.length - 1}
                  onClick={() => onMove(sectionIndex, 1)}
                  aria-label={`Move ${section.title} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => removeSection(section.id)}
                >
                  Remove
                </button>
              </div>
            </div>

            {section.items.map((item, itemIndex) => (
              <div className="section-item" key={item.id}>
                <div className="item-heading">
                  <strong>
                    {definition.itemLabel} {itemIndex + 1}
                  </strong>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => removeItem(section, item.id)}
                  >
                    Remove
                  </button>
                </div>
                <label>
                  {definition.titleLabel}
                  <input
                    value={item.title}
                    onChange={(event) =>
                      updateItem(section, item.id, {
                        title: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  {definition.subtitleLabel}
                  <input
                    value={item.subtitle}
                    onChange={(event) =>
                      updateItem(section, item.id, {
                        subtitle: event.target.value,
                      })
                    }
                  />
                </label>
                {definition.dates && (
                  <div className="date-fields">
                    <label>
                      Start
                      <input
                        type="month"
                        value={item.start_date}
                        onChange={(event) =>
                          updateItem(section, item.id, {
                            start_date: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      End
                      <input
                        type="month"
                        value={item.end_date}
                        onChange={(event) =>
                          updateItem(section, item.id, {
                            end_date: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                )}
                <label>
                  {definition.descriptionLabel}
                  <textarea
                    rows={4}
                    value={item.description}
                    onChange={(event) =>
                      updateItem(section, item.id, {
                        description: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                updateSection(section.id, {
                  items: [...section.items, newItem(section.items.length)],
                })
              }
            >
              Add {definition.itemLabel}
            </button>
          </fieldset>
        );
      })}
    </div>
  );
}
