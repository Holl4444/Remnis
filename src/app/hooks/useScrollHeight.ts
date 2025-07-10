import { useEffect, useState } from 'react';

export function useScrollHeight() {
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    const textArea = document.querySelector(
      '#text-area'
    ) as HTMLTextAreaElement;


    function handleSize() {
      setScrollHeight((textArea.scrollHeight + 2) / 20);
    }
    handleSize();
    textArea.addEventListener('keydown', handleSize);

    return () => {
      textArea.removeEventListener('keydown', handleSize);
    };
  }, []);

  return `${scrollHeight}em`;
}
