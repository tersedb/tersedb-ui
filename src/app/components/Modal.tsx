"use client";

import {useRef, useEffect} from "react";

export default function Modal({
  onSubmit,
  submitLabel,
  submitDisabled,
  children,
  open,
  onCloseModal,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [open])

  const closeButton = onSubmit && (
    <button
      className="btn btn-primary mr-2"
      disabled={submitDisabled}
      onClick={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
      {submitLabel || "Submit"}
    </button>
  );

  return (
    <dialog className="modal" ref={modalRef} onClose={onCloseModal}>
      <div className="modal-box">
        {children}
        <div className="modal-action">
          <form method="dialog">
            {closeButton}
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
}
