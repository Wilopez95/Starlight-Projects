import { useCallback, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash-es';

export const useScrollOnError = (errors: Record<string, unknown>, shouldCheckErrors: boolean) => {
  const requestId = useRef<number | null>(null);

  const scrollToFirstError = useCallback(() => {
    const invalidElement = document.querySelector(`[data-error]`);

    if (invalidElement) {
      const interObserver = new IntersectionObserver(
        (entries, observer) => {
          if (!entries[0].isIntersecting) {
            invalidElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
          observer.disconnect();
        },
        { threshold: [1] },
      );
      interObserver.observe(invalidElement);
    }
    requestId.current = null;
  }, []);

  useEffect(() => {
    if (!isEmpty(errors) && shouldCheckErrors) {
      if (requestId.current) {
        cancelAnimationFrame(requestId.current);
      }
      // This is needed because formik updates errors only after isValidating = false, so useEffect runs twice
      // Could be fixed by using formik's onSubmit & isSubmitting criteria
      requestId.current = requestAnimationFrame(scrollToFirstError);
    }
  }, [errors, scrollToFirstError, shouldCheckErrors]);
};
