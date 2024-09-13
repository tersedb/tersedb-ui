"use client";

import DialogButton from "./DialogButton";

export default function DeleteViaConfirm({
  buttonText,
  buttonExtraClasses,
  onConfirm,
  children,
  confirmText,
  warning,
}: {
  buttonText: string,
  buttonExtraClasses: string,
  onConfirm: () => void,
  children: (_: { button: React.ReactNode }) => React.ReactNode,
  confirmText: string,
  warning: React.ReactNode,
}) {
  return (
    <DialogButton
      buttonText={buttonText}
      buttonVariant={`error ${buttonExtraClasses}`}
      onSubmit={onConfirm}
      submitText={confirmText}
      submitVariant="error"
      modalContent={warning}>
      {children}
    </DialogButton>
  );
}
