"use client";

import Modal from "./Modal";
import {useState} from "react";

export default function DialogButton({
  buttonText,
  buttonVariant,
  children,
  onSubmit,
  submitText,
  submitDisabled,
  submitVariant,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const buttonClassExtra = buttonVariant ? `btn-${buttonVariant}` : "";

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={"btn " + buttonClassExtra}>
        {buttonText}
      </button>
      <Modal
        onSubmit={() => {
          setModalOpen(false);
          onSubmit();
        }}
        submitText={submitText}
        submitDisabled={submitDisabled}
        submitVariant={submitVariant}
        onCloseModal={() => setModalOpen(false)}
        open={modalOpen}>
        {children}
      </Modal>
    </>
  );
}
