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
  modalContent,
  submitText,
  submitDisabled,
  submitVariant,
}: {
  buttonText: string,
  buttonVariant?: string,
  children: (_: { button: React.ReactNode }) => React.ReactNode,
  onSubmit: () => void,
  onOpenModal?: () => void,
  onCloseModal?: () => void,
  modalContent: React.ReactNode,
  submitText: string,
  submitDisabled?: boolean,
  submitVariant?: string,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const buttonClassExtra = buttonVariant ? `btn-${buttonVariant}` : "";

  const button = (
    <button
      onClick={() => setModalOpen(true)}
      className={"btn " + buttonClassExtra}>
      {buttonText}
    </button>
  );

  return (
    <>
      {children({button})}
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
        {modalContent}
      </Modal>
    </>
  );
}
