"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Index (0-based) of the correct option */
  answer: number;
}

/** Interactive multiple-choice quiz for embedding in lesson MDX. */
export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return null;

  const question = questions[current];
  const revealed = selected !== null;
  const isCorrect = selected === question.answer;

  function choose(index: number) {
    if (revealed) return;
    setSelected(index);
    if (index === question.answer) setScore((value) => value + 1);
  }

  function next() {
    if (current + 1 < questions.length) {
      setCurrent((value) => value + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function reset() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="my-6 rounded-xl border p-6 text-center">
        <p className="text-lg font-semibold">
          You scored {score} / {questions.length}
        </p>
        <Button variant="outline" size="sm" onClick={reset} className="mt-4">
          Retake quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Quiz · Question {current + 1} of {questions.length}
      </p>
      <h4 className="mt-2 font-semibold">{question.question}</h4>
      <div className="mt-4 grid gap-2">
        {question.options.map((option, index) => {
          const chosen = selected === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => choose(index)}
              disabled={revealed}
              className={cn(
                "rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                !revealed && "hover:bg-accent",
                revealed &&
                  index === question.answer &&
                  "border-success bg-success/15 text-success dark:bg-success/20 dark:text-success",
                revealed &&
                  chosen &&
                  index !== question.answer &&
                  "border-destructive bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive",
                revealed && !chosen && index !== question.answer && "opacity-60"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p
            className={cn(
              "text-sm font-medium",
              isCorrect ? "text-success" : "text-destructive"
            )}
          >
            {isCorrect ? "Correct!" : "Not quite."}
          </p>
          <Button size="sm" onClick={next}>
            {current + 1 < questions.length ? "Next question" : "See results"}
          </Button>
        </div>
      )}
    </div>
  );
}
