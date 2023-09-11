import { createPortal } from 'react-dom';

const ContextMenuPortal = ({ children }) =>
  createPortal(children, document.querySelector('#context-menu-portal'));

export default ContextMenuPortal;
