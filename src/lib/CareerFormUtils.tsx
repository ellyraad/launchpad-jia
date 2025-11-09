import type { AIInterviewQuestion, DropdownOption, FormState, FormStep, PreScreeningQuestion } from "./definitions";
import { isSalaryRangeValid } from "./Utils";

type UserInfo = { email: string; image: string; name: string; }
export const flattenNewCareerData = (career: FormState, orgID: string, user: UserInfo, isDraft: boolean = true) => {
  const userInfo = {
    image: user.image,
    name: user.name,
    email: user.email
  }

  return {
    jobTitle: career.careerDetails.jobTitle,
    description: career.careerDetails.jobDescription,
    workSetup: career.careerDetails.workArrangement,
    workSetupRemarks: "",
    questions: career.aiScreeningDetails.interviewQuestions,
    lastEditedBy: userInfo,
    createdBy: userInfo,
    screeningSetting: career.cvScreeningDetails.cvScreeningSetting,
    cvSecretPrompt: career.cvScreeningDetails.cvSecretPrompt,
    preScreeningQuestions: career.cvScreeningDetails.preScreeningQuestions,
    salaryNegotiable: career.careerDetails.isSalaryNegotiable,
    minimumSalary: isNaN(Number(career.careerDetails.minSalary)) ? null : Number(career.careerDetails.minSalary),
    maximumSalary: isNaN(Number(career.careerDetails.maxSalary)) ? null : Number(career.careerDetails.minSalary),
    country: career.careerDetails.country,
    province: career.careerDetails.state,
    location: career.careerDetails.city,
    status: "active", // this should be inactive when the career is saved as unpublished OR drafted
    employmentType: career.careerDetails.employmentType,
    orgID,
    draft: isDraft,
  }
}

export const formSteps: FormStep[] = [
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

export const screeningSettingList: DropdownOption[] = [
  { name: "Good Fit and above", icon: "la la-check" },
  { name: "Only Strong Fit", icon: "la la-check-double" },
  { name: "No Automatic Promotion", icon: "la la-times" },
];

export const preScreeningQuestionTypes: DropdownOption[] = [
  { name: "Dropdown", icon: "la la-arrow-circle-down" },
  { name: "Range", icon: "la la-sort-numeric-down" },
  { name: "Short Answer", icon: "la la-user" },
  { name: "Long Answer", icon: "la la-align-left" },
]

export const suggestedPreScreeningQuestions: PreScreeningQuestion[] = [
  {
    id: "suggested-notice-period",
    title: "Notice Period",
    question: "How long is your notice period?",
    questionType: "dropdown",
    options: [
      { name: "Immediately" },
      { name: "< 30 days" },
      { name: "> 30 days" },
    ],
  },
  {
    id: "suggested-work-setup",
    title: "Work Setup",
    question: "How often are you willing to report to the office?",
    questionType: "dropdown",
    options: [
      { name: "At most 1-2x a week" },
      { name: "At most 3-4x a week" },
      { name: "Open to fully onsite work" },
      { name: "Only open to fully remote work" },
    ]
  },
  {
    id: "suggested-asking-salary",
    title: "Asking Salary",
    question: "How much is your expected monthly salary?",
    questionType: "range",
    currency: "PHP",
    preferredRange: { min: 0, max: 0 }
  }
]

export const employmentTypeOptions: DropdownOption[] = [
  { name: "Full-Time" },
  { name: "Part-Time" },
];

export const workArrangementOptions: DropdownOption[] = [
  { name: "Fully Remote" },
  { name: "Onsite" },
  { name: "Hybrid" },
];

export const accessRolesOptions: DropdownOption[] = [
  { name: "Job Owner" },
  { name: "Reviewer" },
  { name: "Contributor" },
];

export const secretPromptTooltip = "These prompts remain hidden from candidates and the public job portal.<br>Additionally, only Admins and the Job Owner can view the secret prompt.";

export const baseAIInterviewQuestion: AIInterviewQuestion[] = [
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

export const validateCareerDetails = (details: FormState["careerDetails"]): boolean => {
  const {
    jobTitle,
    employmentType,
    workArrangement,
    state,
    city,
    jobDescription,
    isSalaryNegotiable,
    minSalary,
    maxSalary
  } = details;

  if (!jobTitle.trim() || !employmentType || !workArrangement || !state || !city || !jobDescription.trim()) {
    return false;
  }

  if (!isSalaryNegotiable) {
    if (!minSalary.trim() || !maxSalary.trim()) {
      return false
    };

    if (!isSalaryRangeValid(minSalary, maxSalary)) {
      return false
    }
  }

  return true;
}

export const isValidInterviewQuestionsCount = (questions: AIInterviewQuestion[]): boolean => {
  const totalQuestions = questions.reduce(
    (acc, group) => acc + group.questions.length, 0
  );
  return totalQuestions >= 5;
}

export const isCurrStepValid = (careerDetails: FormState["careerDetails"], interviewQuestions: AIInterviewQuestion[], stepIndex: number): boolean => {
  if (stepIndex === 0) {
    return validateCareerDetails(careerDetails);
  }
  if (stepIndex === 2) {
    return isValidInterviewQuestionsCount(interviewQuestions);
  }

  return true;
}

export const validateStepStatus = (
  currentStep: number,
  stepIndex: number,
  careerDetails: FormState["careerDetails"],
  interviewQuestions: AIInterviewQuestion[],
  isValid: FormState["isValid"]
): "completed" | "in_progress" | "pending" | "invalid" => {
  if (stepIndex < currentStep) return "completed";

  if (stepIndex === currentStep) {
    if (stepIndex === 0 && isValid.step1 && !isCurrStepValid(careerDetails, interviewQuestions, stepIndex)) {
      return "invalid"
    };
    if (stepIndex === 2 && isValid.step3 && !isCurrStepValid(careerDetails, interviewQuestions, stepIndex)) {
      return "invalid"
    };
    return "in_progress";
  }

  return "pending";
}
