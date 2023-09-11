/* eslint-disable react/prop-types */

import Loader from './Loader';

const wrapperStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: '#aaa',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
// export type Props = {
//   isLoading: boolean,
//   timedOut: boolean,
//   error: boolean,
// };

export default function Loading(props) {
  if (props.isLoading) {
    if (props.timedOut) {
      return <div>Loader timed out!</div>;
    }
    return (
      <div style={wrapperStyle}>
        <Loader />
      </div>
    );
  }
  if (props.error) {
    return <div>Error! Component failed to load</div>;
  }
  return null;
}
