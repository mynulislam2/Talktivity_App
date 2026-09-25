import {
  hasAnswer,
  questionTimestamp,
  optionIndexFor,
  optionReviewState,
} from '../listeningReview';

describe('hasAnswer', () => {
  it('treats an emptied multi-select as unanswered', () => {
    expect(hasAnswer([])).toBe(false);
    expect(hasAnswer(['A'])).toBe(true);
  });

  it('treats blank text as unanswered', () => {
    expect(hasAnswer(undefined)).toBe(false);
    expect(hasAnswer('')).toBe(false);
    expect(hasAnswer('   ')).toBe(false);
    expect(hasAnswer('12/05')).toBe(true);
  });
});

describe('questionTimestamp', () => {
  it('accepts only finite numbers', () => {
    expect(questionTimestamp(0)).toBe(0);
    expect(questionTimestamp(42.5)).toBe(42.5);
    expect(questionTimestamp(undefined)).toBeNull();
    expect(questionTimestamp(null)).toBeNull();
    expect(questionTimestamp('30')).toBeNull();
    expect(questionTimestamp(NaN)).toBeNull();
    expect(questionTimestamp(Infinity)).toBeNull();
  });
});

describe('optionIndexFor', () => {
  const plain = ['a couple plan', 'a family plan', 'a student plan'];
  const lettered = ['A. Emma', 'B) Daniel', 'C: Sara'];

  it('matches option text exactly (after normalising)', () => {
    expect(optionIndexFor('  A Family   Plan ', plain)).toBe(1);
  });

  it('does not read "a ..." as the letter A', () => {
    expect(optionIndexFor('a textbook', plain)).toBe(-1);
  });

  it('maps a single letter to an option by position', () => {
    expect(optionIndexFor('B', plain)).toBe(1);
    expect(optionIndexFor('H', plain)).toBe(-1);
  });

  it('resolves letters and bare text against lettered options', () => {
    expect(optionIndexFor('b', lettered)).toBe(1);
    expect(optionIndexFor('C. Sara', lettered)).toBe(2);
    expect(optionIndexFor('daniel', lettered)).toBe(1);
  });
});

describe('optionReviewState', () => {
  const options = ['a couple plan', 'a family plan', 'a student plan'];

  it('shows idle/selected before submit', () => {
    expect(optionReviewState({ option: options[0], options, selected: true })).toBe('selected');
    expect(optionReviewState({ option: options[1], options, selected: false })).toBe('idle');
  });

  it('colours the selected option from is_correct, not correct_answer', () => {
    // Server says wrong even though the text is close: the pick is red.
    const wrong = { correct_answer: 'a family plan', is_correct: false };
    expect(optionReviewState({ option: options[0], options, selected: true, result: wrong })).toBe(
      'wrong'
    );
    expect(optionReviewState({ option: options[1], options, selected: false, result: wrong })).toBe(
      'missed'
    );

    // Server accepted the pick even though correct_answer is a letter we map elsewhere.
    const right = { correct_answer: 'C', is_correct: true };
    expect(optionReviewState({ option: options[0], options, selected: true, result: right })).toBe(
      'correct'
    );
    expect(optionReviewState({ option: options[2], options, selected: false, result: right })).toBe(
      'idle'
    );
  });

  it('handles multiple-select answers joined with ", "', () => {
    const opts = ['Parking', 'Wi-Fi', 'Breakfast', 'Gym'];
    const result = { correct_answer: 'Wi-Fi, Gym', is_correct: false };
    const state = (option: string, selected: boolean) =>
      optionReviewState({ option, options: opts, selected, result, multi: true });
    expect(state('Wi-Fi', true)).toBe('correct');
    expect(state('Parking', true)).toBe('wrong');
    expect(state('Gym', false)).toBe('missed');
    expect(state('Breakfast', false)).toBe('idle');
  });
});
