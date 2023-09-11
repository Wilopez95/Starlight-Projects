# ErrorBoundary

The simplest way to use a boundary is to wrap it around any component that may throw an error. This will handle errors thrown by that component's descendants also.

```jsx
import ErrorBoundary from 'components/ErrorBoundary';

<ErrorBoundary>
  <ComponentThatMayError />
</ErrorBoundary>;
```

You can react to errors (eg for logging) by providing an `onError` callback:

```jsx
import ErrorBoundary from 'components/ErrorBoundary';

const myErrorHandler = (error: Error, componentStack: string) => {
  // ...
};

<ErrorBoundary onError={myErrorHandler}>
  <ComponentThatMayError />
</ErrorBoundary>;
```

You can also use it as a HOC:

```jsx
import {withErrorBoundary} from 'components/ErrorBoundary';

const ComponentWithErrorBoundary = withErrorBoundary(
  ComponentToDecorate: Element<any>,
  CustomFallbackComponent: ?Element<any>,
  onErrorHandler: ?(error: Error, componentStack: string) => void,
);
```
