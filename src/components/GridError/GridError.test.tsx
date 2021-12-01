import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { render, screen } from './../../utils/rtl';
import GridError from './GridError';

test('it renders', () => {
  const message = 'test error message';
  render(<GridError message={message} />);

  screen.getByText('Something went wrong');
  screen.getByText(message);
});
