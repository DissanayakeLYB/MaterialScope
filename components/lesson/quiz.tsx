"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Quiz — an interactive question set embeddable in lesson MDX.
 *
 * Usage in MDX:
 *
 *   <Quiz
 *     questions={[
 *       {
 *         type: "multiple-choice",
 *         prompt: "…",
 *         options: ["A", "B", "C"],
 *         correctAnswer: 1,          // index of the correct option
 *         explanation: "…",
 *       },
 *       {
 *         type: "numerical",
 *         prompt: "… (in g/cm³)",
 *         correctAnswer: 8.9,
 *         tolerance: 2,              // percent, default 2
 *         explanation: "…",
 *       },
 *     ]}
 *   />
 *
 * The legacy shape ({ question, options, answer }) is still accepted and
 * normalized to multiple-choice on the fly, so older lessons keep working.
 *
 * Attempts are kept in component state but shaped as a persist-ready
 * `QuizResult` (see onComplete) so wiring a backend later is a drop-in.
 */

export interface MultipleChoiceQuestion {
  type: "multiple-choice";
  prompt: string;
  options: string[];
  /** Index (0-based) of the correct option. */
  correctAnswer: number;
  /** Shown after answering. */
  explanation?: string;
}

export interface NumericalQuestion {
  type: "numerical";
  prompt: string;
  correctAnswer: number;
  /** Mark close answers correct within this percent (default 2, e.g. ±2%). */
  tolerance?: number;
  /** Unit for the correct-answer feedback, e.g. "g/cm³". */
  unit?: string;
  explanation?: string;
}

export type QuizQuestion = MultipleChoiceQuestion | NumericalQuestion;

/** Legacy shape ({ question, options, answer }) — normalized on the fly. */
interface LegacyQuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

type RawQuestion = QuizQuestion | LegacyQuizQuestion;

function normalize(raw: RawQuestion): QuizQuestion {
  if (typeof (raw as LegacyQuizQuestion).question === "string") {
    const legacy = raw as LegacyQuizQuestion;
    return {
      type: "multiple-choice",
      prompt: legacy.question,
      options: legacy.options,
      correctAnswer: legacy.answer,
    };
  }
  return raw as QuizQuestion;
}

/** One submitted answer, recorded for persistence. */
export interface QuizAttempt {
  /** Index into the original `questions` array. */
  questionIndex: number;
  /** Raw submitted answer: option index as a string, or typed number. */
  answer: string;
  correct: boolean;
  submittedAt: string;
}

/** Persist-ready result — hand this to a backend via onComplete. */
export interface QuizResult {
  total: number;
  score: number;
  attempts: QuizAttempt[];
  startedAt: string;
  completedAt: string;
}

function isAnswerCorrect(question: QuizQuestion, rawAnswer: string): boolean {
  if (question.type === "multiple-choice") {
    return rawAnswer === String(question.correctAnswer);
  }
  const value = Number.parseFloat(rawAnswer);
  if (!Number.isFinite(value)) return false;
  if (question.correctAnswer === 0) return value === 0;
  const tolerance = (question.tolerance ?? 2) / 100;
  return (
    Math.abs(value - question.correctAnswer) /
      Math.abs(question.correctAnswer) <=
    tolerance
  );
}

interface QuizProps {
  questions: RawQuestion[];
  /** Called when a session completes (initial run or retry). */
  onComplete?: (result: QuizResult) => void;
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const normalized = questions.map(normalize);

  // `session` holds the indices of questions in the current run. It starts
  // as the full list and shrinks to the incorrect ones on "Retry".
  const [session, setSession] = useState<number[]>(() =>
    normalized.map((_, index) => index)
  );
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [sessionStartedAt, setSessionStartedAt] = useState(() =>
    new Date().toISOString()
  );
  const [finished, setFinished] = useState(false);
  const [draft, setDraft] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  if (normalized.length === 0) return null;

  const questionIndex = session[current];
  const question = normalized[questionIndex];
  const answered = answers[questionIndex] !== undefined;
  const correct = answered && isAnswerCorrect(question, answers[questionIndex]);
  const isLast = current + 1 >= session.length;

  const sessionScore = session.filter(
    (index) =>
      answers[index] !== undefined &&
      isAnswerCorrect(normalized[index], answers[index])
  ).length;

  function submitAnswer(qIndex: number, rawAnswer: string) {
    const q = normalized[qIndex];
    if (!q || answers[qIndex] !== undefined) return;
    const wasCorrect = isAnswerCorrect(q, rawAnswer);
    setAnswers((prev) => ({ ...prev, [qIndex]: rawAnswer }));
    setAttempts((prev) => [
      ...prev,
      {
        questionIndex: qIndex,
        answer: rawAnswer,
        correct: wasCorrect,
        submittedAt: new Date().toISOString(),
      },
    ]);
  }

  function chooseOption(optionIndex: number) {
    if (answered) return;
    submitAnswer(questionIndex, String(optionIndex));
  }

  function checkNumerical() {
    if (answered) return;
    const trimmed = draft.trim();
    if (trimmed === "") {
      setInputError("Enter a number before checking.");
      return;
    }
    if (!Number.isFinite(Number.parseFloat(trimmed))) {
      setInputError("Please enter a valid number (e.g. 8.9 or 2.3e19).");
      return;
    }
    setInputError(null);
    submitAnswer(questionIndex, trimmed);
  }

  function finishSession() {
    onComplete?.({
      total: session.length,
      score: sessionScore,
      attempts,
      startedAt: sessionStartedAt,
      completedAt: new Date().toISOString(),
    });
    setFinished(true);
  }

  function next() {
    if (isLast) {
      finishSession();
    } else {
      setCurrent((value) => value + 1);
      setDraft("");
      setInputError(null);
    }
  }

  function retryIncorrect() {
    const wrong = session.filter(
      (index) =>
        answers[index] !== undefined &&
        !isAnswerCorrect(normalized[index], answers[index])
    );
    if (wrong.length === 0) return;
    setSession(wrong);
    setAnswers((prev) => {
      const next = { ...prev };
      wrong.forEach((index) => delete next[index]);
      return next;
    });
    setSessionStartedAt(new Date().toISOString());
    setCurrent(0);
    setDraft("");
    setInputError(null);
    setFinished(false);
  }

  function retake() {
    setSession(normalized.map((_, index) => index));
    setAnswers({});
    setAttempts([]);
    setSessionStartedAt(new Date().toISOString());
    setCurrent(0);
    setDraft("");
    setInputError(null);
    setFinished(false);
  }

  if (finished) {
    const wrongCount = session.length - sessionScore;
    return (
      <div className="my-6 rounded-xl border p-6 text-center">
        <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quiz complete
        </p>
        <p className="mt-3 text-4xl font-bold tracking-tight">
          {sessionScore}
          <span className="text-2xl font-semibold text-muted-foreground">
            {" "}
            / {session.length}
          </span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">correct</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {wrongCount > 0 && (
            <Button onClick={retryIncorrect}>
              Retry incorrect ({wrongCount})
            </Button>
          )}
          <Button variant="outline" onClick={retake}>
            Retake full quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Quiz · Question {current + 1} of {session.length}
      </p>
      <h4 className="mt-2 font-semibold">{question.prompt}</h4>

      {question.type === "multiple-choice" ? (
        <div className="mt-4 grid gap-2">
          {question.options.map((option, optionIndex) => {
            const chosen = answers[questionIndex] === String(optionIndex);
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => chooseOption(optionIndex)}
                disabled={answered}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                  !answered && "hover:bg-accent",
                  answered &&
                    optionIndex === question.correctAnswer &&
                    "border-success bg-success/15 text-success dark:bg-success/20 dark:text-success",
                  answered &&
                    chosen &&
                    optionIndex !== question.correctAnswer &&
                    "border-destructive bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive",
                  answered &&
                    !chosen &&
                    optionIndex !== question.correctAnswer &&
                    "opacity-60"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          className="mt-4 flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            checkNumerical();
          }}
        >
          <input
            type="text"
            inputMode="decimal"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setInputError(null);
            }}
            disabled={answered}
            placeholder="e.g. 8.9"
            aria-label="Your answer"
            className="h-9 w-36 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
          />
          <Button type="submit" size="sm" disabled={answered}>
            Check
          </Button>
          {inputError && (
            <p className="w-full text-sm text-destructive">{inputError}</p>
          )}
        </form>
      )}

      {answered && (
        <div className="mt-5 border-t pt-4">
          <p
            className={cn(
              "text-sm font-semibold",
              correct ? "text-success" : "text-destructive"
            )}
          >
            {correct
              ? "Correct!"
              : question.type === "numerical"
                ? `Not quite. The correct answer is ${question.correctAnswer}${
                    question.unit ? ` ${question.unit}` : ""
                  }.`
                : "Not quite."}
          </p>
          {question.explanation && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {question.explanation}
            </p>
          )}
          <Button size="sm" onClick={next} className="mt-3">
            {isLast ? "See results" : "Next question"}
          </Button>
        </div>
      )}
    </div>
  );
}
