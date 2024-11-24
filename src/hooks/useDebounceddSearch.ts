import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

const useDebouncedSearch = (input: string, delay: number = 500) => {
  const [debouncedInput, setDebouncedInput] = useState(input);

  useEffect(() => {
    const handler = debounce(() => setDebouncedInput(input), delay);
    handler();

    return () => {
      handler.cancel();
    };
  }, [input, delay]);

  return debouncedInput;
};

export default useDebouncedSearch;
