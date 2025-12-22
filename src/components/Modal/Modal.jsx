import React, { useEffect } from 'react';
import { lockScroll, unlockScroll } from '../../utils/helpers';
import './Modal.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Removed backdrop click handler to prevent closing modal when clicking outside

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
