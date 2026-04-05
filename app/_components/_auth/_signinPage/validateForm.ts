import { Dispatch, SetStateAction } from "react";

interface formData {
  email: string;
  password: string;
}

type setErrorsType = Dispatch<SetStateAction<formData>>;

export const validateForm = (
  formData: formData,
  setErrors: setErrorsType,
): boolean => {
  const newErrors = {
    email: "",
    password: "",
  };

  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Please enter a valid email";
  }

  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 6) {
    newErrors.password = "Password must be at least 6 characters";
  }

  setErrors(newErrors);

  return !Object.values(newErrors).some((msg) => msg !== "");
};
