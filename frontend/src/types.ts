export type Resume = {
  id: string;
  title: string;
  document: ResumeDocument;
  version: number;
};
export type ResumeDocument = {
  schema_version: 1;
  basics: {
    name: string;
    headline: string;
    email?: string;
    phone: string;
    location: string;
    summary: string;
    links: { label: string; url: string }[];
  };
  sections: Section[];
  presentation: {
    template: "modern" | "classic";
    font: "sans" | "serif";
    accent: string;
    spacing: "compact" | "comfortable";
  };
};
export type Section = {
  id: string;
  kind: string;
  title: string;
  order: number;
  visible: boolean;
  items: SectionItem[];
};
export type SectionItem = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  start_date: string;
  end_date: string;
};
