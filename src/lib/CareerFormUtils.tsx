import type { AIInterviewQuestion, DropdownOption, FormStep } from "./definitions";

const formSteps: FormStep[] = [
  {
    title: "Career Details & Team Access",
    tooltips: [
      {
        highlightText: "Use clear, standard job titles",
        restOfText: "for better searchability (e.g., “Software Engineer” instead of “Code Ninja” or “Tech Rockstar”).",
      },
      {
        highlightText: "Avoid abbreviations",
        restOfText: "or internal role codes that applicants may not understand (e.g., use “QA Engineer” instead of “QE II” or “QA-TL”).",
      },
      {
        highlightText: "Keep it concise",
        restOfText: " – job titles should be no more than a few words (2–4 max), avoiding fluff or marketing terms.",
      }
    ],
  },

  {
    title: "CV Review & Pre-screening",
    tooltips: [
      {
        highlightText: "Add a secret prompt",
        restOfText: "to fine-tune how Jia scores and evaluates submitted CV.",
      },
      {
        highlightText: "Add pre-screening questions",
        restOfText: "to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions.",
      }
    ]
  },

  {
    title: "AI Interview Setup",
    tooltips: [
      {
        highlightText: "Add a secret prompt",
        restOfText: "to fine-tune how Jia scores and evaluates the interview responses.",
      },
      {
        highlightText: "Use \"Generate Questions\"",
        restOfText: "to quickly create tailored interview questions, then refine or mix them with your own for balanced results.",
      },
    ]
  },
  {
    title: "Review Center",
  }
]

const screeningSettingList: DropdownOption[] = [
  { name: "Good Fit and above", icon: "la la-check" },
  { name: "Only Strong Fit", icon: "la la-check-double" },
  { name: "No Automatic Promotion", icon: "la la-times" },
];

const employmentTypeOptions: DropdownOption[] = [
  { name: "Full-Time" },
  { name: "Part-Time" },
];

const workArrangementOptions: DropdownOption[] = [
  { name: "Fully Remote" },
  { name: "Onsite" },
  { name: "Hybrid" },
];

const accessRolesOptions: DropdownOption[] = [
  { name: "Job Owner" },
  { name: "Reviewer" },
  { name: "Contributor" },
];

const secretPromptTooltip = "These prompts remain hidden from candidates and the public job portal.<br>Additionally, only Admins and the Job Owner can view the secret prompt.";

const baseAIInterviewQuestion: AIInterviewQuestion[] = [
  {
    id: 1,
    category: "CV Validation / Experience",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 2,
    category: "Technical",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 3,
    category: "Behavioral",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 4,
    category: "Analytical",
    questionCountToAsk: null,
    questions: [],
  },
  {
    id: 5,
    category: "Others",
    questionCountToAsk: null,
    questions: [],
  },
];

export {
  formSteps,
  secretPromptTooltip,
  baseAIInterviewQuestion,
  employmentTypeOptions,
  workArrangementOptions,
  accessRolesOptions,
  screeningSettingList,
};
