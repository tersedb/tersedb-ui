"use client";

import {useRef, useEffect, useState} from "react";

function genId(): string {
  const genRanHex = (size: number) =>
    [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  return genRanHex(16);
}


export default function Modal({
  onSubmit,
  submitText,
  submitDisabled,
  submitVariant,
  children,
  open,
  onOpenModal,
  onCloseModal,
}: {
  onSubmit: () => void,
  submitText: string,
  submitDisabled?: boolean,
  submitVariant?: string,
  children: React.ReactNode,
  open: boolean,
  onOpenModal?: () => void,
  onCloseModal?: () => void,
}) {
  const modalRef = useRef<HTMLInputElement>(null);
  const [modalId, _] = useState(genId());

  useEffect(() => {
    if (modalRef.current)
      modalRef.current.checked = open;
    if (open && onOpenModal) {
      onOpenModal();
    } else if (!open && onCloseModal) {
      onCloseModal();
    }
  }, [open]);

  const submitExtraClasses = submitVariant ? `btn-${submitVariant}` : ""

  const submitButton = onSubmit && (
    <button
      className={"btn mr-2 " + submitExtraClasses}
      disabled={submitDisabled}
      onClick={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
      {submitText || "Submit"}
    </button>
  );

  return (
    <>
      <input type="checkbox" id={modalId} className="modal-toggle" ref={modalRef} />
      <div className="modal">
        <div className="modal-box">
          {children}
          <div className="modal-action">
            {submitButton}
            <label className="btn" htmlFor={modalId}>Close</label>
          </div>
        </div>
        <label htmlFor={modalId} className="modal-backdrop">Close</label>
      </div>
    </>
  );
}
