"use client";

import Modal from "./Modal";
import {useState} from "react";

export default function DialogButton({
  buttonText,
  buttonVariant,
  children,
  onSubmit,
  onOpenModal,
  onCloseModal,
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
        onOpenModal={onOpenModal}
        onCloseModal={onCloseModal}
        open={modalOpen}>
        {children}
      </Modal>
    </>
  );
}
