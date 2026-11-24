import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App, ROUTER_FUTURE } from '../src/App';
import { MemorialProvider } from '../src/app/MemorialContext';
import type { Memorial } from '../src/content/types';
import type { ServiceState } from '../src/lib/service';

interface Options {
  renderedAt?: number;
  servicePreview?: ServiceState;
  path?: string;
}

export function renderMemorial(memorial: Memorial, options: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[options.path ?? '/']} future={ROUTER_FUTURE}>
      <MemorialProvider memorial={memorial} renderedAt={options.renderedAt} servicePreview={options.servicePreview}>
        <App />
      </MemorialProvider>
    </MemoryRouter>,
  );
}
