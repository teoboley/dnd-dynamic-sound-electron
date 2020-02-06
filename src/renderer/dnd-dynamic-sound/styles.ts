import styled from 'styled-components';

export const Container = styled.div({
  backgroundColor: '#666666',
  color: '#FBFBFB',
  code: {
    fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace"
  },
  boxSizing: 'border-box',
  '*, *:before, *:after': {
    boxSizing: 'inherit'
  }
});
