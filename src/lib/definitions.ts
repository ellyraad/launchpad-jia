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
