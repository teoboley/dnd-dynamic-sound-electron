import React from 'react';

export const usePrevious = <T>(state: T): T => {
  const ref = React.useRef<T>(state);

  React.useEffect(() => {
    ref.current = state;
  }, [state]);

  return ref.current;
};
