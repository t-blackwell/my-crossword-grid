// eslint-disable-next-line @typescript-eslint/no-redeclare
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { DEFAULT_HTML_TAGS } from '../../utils/general';
import { store } from './../../redux/store';
import data from './../../testData/test.valid.1';
import { getGroupCells, getGroupSeparators } from './../../utils/clue';
import { initialiseStore } from './../../utils/test';
import AnagramHelper from './AnagramHelper';

test('it renders', () => {
  initialiseStore(store, data);
  const oneAcross = store
    .getState()
    .clues.clues.find((clue) => clue.id === '1-across')!;
  const groupCells = getGroupCells(['1-across'], store.getState().cells.cells);
  const groupSeparators = getGroupSeparators(
    ['1-across'],
    store.getState().clues.clues,
  );
  const onClose = jest.fn();

  render(
    <AnagramHelper
      allowedHtmlTags={DEFAULT_HTML_TAGS}
      clue={oneAcross}
      groupCells={groupCells}
      groupSeparators={groupSeparators}
      onClose={onClose}
    />,
  );

  // clue starts broken out into clickable words
  screen.getByText('1 across');
  screen.getByText('Toy');
  screen.getByText('on');
  screen.getByText('a');
  screen.getByText('string');

  // input should be empty
  const input = screen.getByPlaceholderText('Enter letters...');
  expect(input).toHaveValue('');

  // buttons should be disabled
  const reset = screen.getByRole('button', { name: 'Reset' });
  expect(reset).toBeDisabled();
  const shuffle = screen.getByRole('button', { name: 'Shuffle' });
  expect(shuffle).toBeDisabled();

  // check close button calls function
  const close = screen.getByRole('button', { name: 'Close' });
  userEvent.click(close);
  expect(onClose).toHaveBeenCalledTimes(1);

  // type character into input
  userEvent.type(input, 'wxyz');

  // check character counter is visible and buttons are now enabled
  screen.getByText('4/4');
  expect(reset).toBeEnabled();
  expect(shuffle).toBeEnabled();

  // shuffle letters into word wheel
  userEvent.click(shuffle);

  // input control should have been removed
  expect(input).not.toBeInTheDocument();

  // check clue is now a single string
  screen.getByText('Toy on a string (2-2)');

  // check characters appear twice (word wheel and solution)
  expect(screen.getAllByText('W').length).toBe(2);
  expect(screen.getAllByText('X').length).toBe(2);
  expect(screen.getAllByText('Y').length).toBe(2);
  expect(screen.getAllByText('Z').length).toBe(2);

  // reset buttons and input
  userEvent.click(reset);

  // type letters and hit escape to clear
  const newInput = screen.getByPlaceholderText('Enter letters...');
  userEvent.type(newInput, 'abc'); // can't use {esc}
  fireEvent.keyDown(newInput, { key: 'Escape', code: 'Escape' });
  expect(newInput).toHaveValue('');

  // type letters and hit enter to shuffle
  userEvent.type(newInput, 'xyz'); // can't use {enter}
  fireEvent.keyDown(newInput, { key: 'Enter', code: 'Enter' });

  // input control should have been removed again
  expect(newInput).not.toBeInTheDocument();

  // check W isn't include this time
  expect(screen.queryByText('W')).toBeNull();

  // check characters appear twice (word wheel and solution)
  expect(screen.getAllByText('X').length).toBe(2);
  expect(screen.getAllByText('Y').length).toBe(2);
  expect(screen.getAllByText('Z').length).toBe(2);
});
