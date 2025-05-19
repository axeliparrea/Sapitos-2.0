import MessageBox from "@ui5/webcomponents-react/lib/MessageBox.js";

export const showAlert = async (title, message, type = "Information") => {
  return MessageBox.show(message, {
    titleText: title,
    icon: type,
    actions: ["OK"]
  });
};

export const showToast = (message, duration = 3000) => {
  let toast = document.getElementById("global-toast");
  if (!toast) {
    toast = document.createElement("ui5-toast");
    toast.id = "global-toast";
    document.body.appendChild(toast);
  }

  toast.setAttribute("duration", duration);
  toast.textContent = message;
  toast.show();
};

export const showConfirm = async (title, message) => {
  return MessageBox.show(message, {
    titleText: title,
    icon: "Question",
    actions: ["OK", "Cancel"]
  });
};
