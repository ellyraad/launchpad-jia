import { suggestedPreScreeningQuestions } from "@/lib/CareerFormUtils";

type PreScreeningQuestion = {
  id: string;
  title: string;
  question: string;
  questionType: "dropdown" | "range" | "shorttext" | "longtext";
  options?: { name: string }[];
  answer?: { min: number; max: number } | string;
  currency?: string;
};

export function usePreScreeningQuestions(
  initialQuestions: PreScreeningQuestion[],
  onQuestionsChange: (questions: PreScreeningQuestion[]) => void
) {
  const handleAddCustomQuestion = () => {
    const newQuestion: PreScreeningQuestion = {
      id: `custom-${Date.now()}`,
      title: "",
      question: "",
      questionType: "dropdown",
      options: [{ name: "" }],
    };

    onQuestionsChange([...initialQuestions, newQuestion]);
  };

  const handleAddSuggestedQuestion = (
    suggestedQuestion: typeof suggestedPreScreeningQuestions[0]
  ) => {
    const newQuestion: PreScreeningQuestion = {
      id: `${suggestedQuestion.id}-${Date.now()}`,
      title: suggestedQuestion.title,
      question: suggestedQuestion.question,
      questionType: suggestedQuestion.questionType,
      options: suggestedQuestion.options
        ? [...suggestedQuestion.options]
        : undefined,
    };

    onQuestionsChange([...initialQuestions, newQuestion]);
  };

  const handleDeleteQuestion = (questionId: string) => {
    onQuestionsChange(initialQuestions.filter((q) => q.id !== questionId));
  };

  const handleUpdateQuestion = (
    questionId: string,
    field: string,
    value: any
  ) => {
    onQuestionsChange(
      initialQuestions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    );
  };

  const handleAddOption = (questionId: string) => {
    onQuestionsChange(
      initialQuestions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), { name: "" }] }
          : q
      )
    );
  };

  const handleDeleteOption = (questionId: string, optionIndex: number) => {
    onQuestionsChange(
      initialQuestions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options?.filter((_, idx) => idx !== optionIndex) }
          : q
      )
    );
  };

  const handleUpdateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    onQuestionsChange(
      initialQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, idx) =>
                idx === optionIndex ? { name: value } : opt
              ),
            }
          : q
      )
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    e.dataTransfer.setData("questionId", questionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const bounding = target.getBoundingClientRect();
    const offset = bounding.y + bounding.height / 2;

    if (e.clientY - offset > 0) {
      target.style.borderBottom = "3px solid #4F46E5";
      target.style.borderTop = "none";
    } else {
      target.style.borderTop = "3px solid #4F46E5";
      target.style.borderBottom = "none";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.borderTop = "none";
    target.style.borderBottom = "none";
  };

  const handleDrop = (e: React.DragEvent, targetQuestionId: string) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.style.borderTop = "none";
    target.style.borderBottom = "none";

    const draggedQuestionId = e.dataTransfer.getData("questionId");
    if (draggedQuestionId === targetQuestionId) return;

    const questions = [...initialQuestions];
    const draggedIndex = questions.findIndex((q) => q.id === draggedQuestionId);
    const targetIndex = questions.findIndex((q) => q.id === targetQuestionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const bounding = target.getBoundingClientRect();
    const offset = bounding.y + bounding.height / 2;
    const isAfter = e.clientY - offset > 0;

    const [draggedQuestion] = questions.splice(draggedIndex, 1);

    const newTargetIndex =
      draggedIndex < targetIndex
        ? isAfter
          ? targetIndex
          : targetIndex - 1
        : isAfter
        ? targetIndex + 1
        : targetIndex;

    questions.splice(newTargetIndex, 0, draggedQuestion);

    onQuestionsChange(questions);
  };

  return {
    handleAddCustomQuestion,
    handleAddSuggestedQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
    handleAddOption,
    handleDeleteOption,
    handleUpdateOption,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

export type PreScreeningQuestionsHook = ReturnType<typeof usePreScreeningQuestions>;
