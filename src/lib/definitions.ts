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
  questionCountToAsk: string | null;
  questions: string[]
};

export type DropdownOption = {
  name: string;
  icon?: string;
};

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
  payload: string | boolean | AIInterviewQuestion[];
}
