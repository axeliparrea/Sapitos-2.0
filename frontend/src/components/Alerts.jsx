import { MessageBox } from "@ui5/webcomponents-react";

export const showAlert = (title, message, type = "Information") => {
  const iconMap = {
    "Error": MessageBox.Icon.ERROR,
    "Warning": MessageBox.Icon.WARNING,
    "Success": MessageBox.Icon.SUCCESS,
    "Information": MessageBox.Icon.INFORMATION,
    "Question": MessageBox.Icon.QUESTION
  };

  MessageBox.show({
    children: message,
    titleText: title,
    icon: iconMap[type],
    actions: [MessageBox.Action.OK]
  });
};

export const showToast = (message, duration = 3000) => {
  const toast = document.createElement("ui5-toast");
  toast.duration = duration;
  toast.text = message;
  document.body.appendChild(toast);
  toast.show();
};