export const careerDetail = {
  company: {
    name: "ProStack360",
    role: "Software Developer – Frontend",
    duration: "Jun 2023 – Jul 2025",
    logo: "/logos/prostack360.svg",
    heroMedia: "/videos/prostack-demo.mp4"
  },

  productContext: {
    description:
      "ProStack360 is a modular CRM platform built for workflow automation, form management, real-time collaboration, and analytics across teams.",
    modules: ["CRM", "Forms", "Email", "Analytics", "Real-Time"]
  },

  architecture: {
    diagram: "/images/architecture.png",
    stack: {
      frontend: "React · Next.js · TypeScript",
      realtime: "WebSockets · SSE",
      backend: "Node · Express",
      data: "MongoDB · Redis",
      cloud: "AWS S3 · EC2 · CloudFront"
    },
    highlights: [
      "Modular frontend architecture",
      "Event-driven real-time communication",
      "CDN-backed static & media delivery"
    ]
  },

  role: [
    "Owned frontend architecture and UI systems",
    "Built real-time features and collaborative workflows",
    "Designed reusable components and editors",
    "Worked closely with backend and product teams"
  ],

  projects: [
    {
      title: "Email Editor",
      tags: ["Editor", "Real-Time", "Productivity"],
      problem:
        "Users needed a Gmail-like editor with drafts, templates, and previews.",
      solution:
        "Built a modular email editor using Tiptap with autosave, signatures, previews, and export support.",
      tech: [
        "Tiptap extensions and schema design",
        "LocalStorage auto-draft recovery",
        "Async save with REST APIs"
      ],
      media: "/videos/email-editor.mp4",
      outcome: [
        "Faster email creation",
        "Reduced data loss from crashes"
      ]
    },
    {
      title: "Form Builder",
      tags: ["Drag-and-Drop", "No-Code", "Builder"],
      problem:
        "Non-technical users needed a way to create dynamic forms and layouts.",
      solution:
        "Built a drag-and-drop form and layout builder using dnd-kit and react-grid-layout.",
      tech: [
        "Component-driven form schema",
        "Grid-based layout system",
        "Validation and submission flows"
      ],
      media: "/videos/form-builder.mp4",
      outcome: [
        "Enabled no-code form creation",
        "Reduced engineering dependency"
      ]
    }
  ],

  techStack: {
    frontend: "React · Next.js · TypeScript · SCSS",
    state: "Hookstate",
    editors: "Tiptap · @react-email",
    realtime: "WebSockets · SSE",
    cloud: "AWS S3 · EC2 · CloudFront"
  },

  impact: [
    "~30% reduction in load times",
    "~25% improvement in collaboration workflows",
    "Enabled scalable, reusable UI systems"
  ],

  learnings: [
    "Real-time systems require failure-first thinking",
    "Modular UI systems scale better than page-level design",
    "State architecture impacts performance more than rendering"
  ]
};
