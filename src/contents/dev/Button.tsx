import { StrictMode } from 'react';
import ReactDOM, { Container } from 'react-dom/client';
import MuiButton from '@mui/material/Button';
import Page from '@src/pages/layout/Page.tsx';

export interface ActionProps {
  name: string;
  onClick: () => void;
}

interface ButtonProps {
  actions: ActionProps | Array<ActionProps>
}

export function Button({ actions }: ButtonProps) {
  const buttons = Array.isArray(actions) ? actions : [actions];

  return buttons.map((button, i) => (
    <MuiButton
      key={button.name}
      variant="contained"
      onClick={button.onClick}
      sx={{
        ml: i === 0 ? 0 : 1,
        fontSize: '14px'
      }}
    >
      {button.name}
    </MuiButton>
  ));
}

// eslint-disable-next-line react-refresh/only-export-components
export function render(el: Container, props: ButtonProps) {
  ReactDOM.createRoot(el).render(
    <StrictMode>
      <Page>
        <Button
          {...props}
        />
      </Page>
    </StrictMode>,
  );
}
