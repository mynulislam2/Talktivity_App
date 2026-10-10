/**
 * IELTS Listening review helpers.
 *
 * Contract 7: the student's own answer is coloured from the server's
 * `is_correct`; `correct_answer` is only used to point at the right option.
 */

export type ListeningAnswer = string | string[] | undefined;

/** A question counts as answered only with non-blank text or at least one pick. */
export function hasAnswer(value: ListeningAnswer): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return String(value ?? '').trim() !== '';
}

/** The seek position for a question, or null unless it is a real number. */
export function questionTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalize(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

// "A. Emma", "B) Daniel", "(C) Sara", "D: Tom". Not "a family plan".
const LETTER_PREFIX = /^\(?([a-h])[.):]\s+/;

/** Index of the option an answer refers to, or -1. */
export function optionIndexFor(answer: unknown, options: string[]): number {
  const a = normalize(answer);
  if (!a) return -1;
  const norm = options.map(normalize);
  const exact = norm.indexOf(a);
  if (exact >= 0) return exact;

  const lettered = norm.length > 0 && norm.every((o) => LETTER_PREFIX.test(o));
  if (lettered) {
    const letter = /^[a-h]$/.test(a) ? a : a.match(LETTER_PREFIX)?.[1];
    if (letter) return norm.findIndex((o) => o.match(LETTER_PREFIX)?.[1] === letter);
    return norm.findIndex((o) => o.replace(LETTER_PREFIX, '') === a);
  }
  if (/^[a-h]$/.test(a)) {
    const i = a.charCodeAt(0) - 97;
    return i < options.length ? i : -1;
  }
  return -1;
}

export type OptionReviewState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed';

/**
 * How one option looks. Before submit: idle/selected. After submit a selected
 * option is correct/wrong by `is_correct`; an unpicked right option is
 * "missed" when the student got the question wrong.
 */
export function optionReviewState(params: {
  option: string;
  options: string[];
  selected: boolean;
  result?: { correct_answer?: unknown; is_correct: boolean } | null;
  multi?: boolean;
}): OptionReviewState {
  const { option, options, selected, result, multi } = params;
  if (!result) return selected ? 'selected' : 'idle';

  const index = options.indexOf(option);
  // The server joins multiple-select answers with ", ".
  // ponytail: an option whose own text contains ", " won't be found here; the grade itself is server-side.
  const expected = multi
    ? String(result.correct_answer ?? '').split(',')
    : [String(result.correct_answer ?? '')];
  const isRight = expected.some((e) => optionIndexFor(e, options) === index);

  if (selected) {
    if (result.is_correct) return 'correct';
    return multi && isRight ? 'correct' : 'wrong';
  }
  return !result.is_correct && isRight ? 'missed' : 'idle';
}
