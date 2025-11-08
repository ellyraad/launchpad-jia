/** A single tooltip paragraph */
export type ToolTip = {
  /* Part of the tooltip that will be emphasized in bold; also will be put at the start of the paragraph */
  highlightText: string;
  restOfText: string;
};

export type FormStep = {
  title: string;
  tooltips?: ToolTip[]
};

export type AIInterviewQuestion = {
  id: number;
  category: string;
  questionCountToAsk: number | null;
  questions: Array<{ id: string; question: string }>
};

export type DropdownOption = {
  name: string;
  icon?: string;
};

export type PreScreeningQuestion = {
  id: string;
  title: string;
  question: string;
  questionType: "dropdown" | "range" | "shorttext" | "longtext";
  options?: DropdownOption[];
  answer?:
    | string
    | { min: number, max: number };  // for handlng range type
}

export type FormState = {
  careerDetails: {
    jobTitle: string,
    employmentType: string,
    workArrangement: string,
    country: string,
    state: string,
    city: string,

    isSalaryNegotiable: boolean,
    minSalary: string,
    maxSalary: string,
    salaryCurrency: string,
    jobDescription: string,
  };

  cvScreeningDetails: {
    cvScreeningSetting: string,
    cvSecretPrompt: string,
    preScreeningQuestions: PreScreeningQuestion[];
  };

  aiScreeningDetails: {
    aiScreeningSetting: string,
    isVideoInterviewRequired: boolean,
    interviewQuestions: AIInterviewQuestion[],
  };

  teamAccessDetails: {
    accessRole: string,
    authorizedMembers: string,
  };

  validationErrors: Record<string, boolean>;
}

export type FormReducerAction = {
  type: "SET";
  category: keyof FormState;
  field: string;
  payload: string | boolean | AIInterviewQuestion[] | PreScreeningQuestion[];
}
