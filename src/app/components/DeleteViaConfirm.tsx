"use client";

import DialogButton from "./DialogButton";

export default function DeleteViaConfirm({
  buttonText,
  buttonExtraClasses,
  onConfirm,
  children,
  confirmText,
}) {
  return (
    <DialogButton
      buttonText={buttonText}
      buttonVariant={`error ${buttonExtraClasses}`}
      onSubmit={onConfirm}
      submitText={confirmText}
      submitVariant="error">
      {children}
    </DialogButton>
  );
}
