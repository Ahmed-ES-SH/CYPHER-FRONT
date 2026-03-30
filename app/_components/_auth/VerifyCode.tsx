"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { VscLoading } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { PiWarningOctagon } from "react-icons/pi";
import { instance } from "../_global/AxiosTool";

interface props {
  onClose: () => void;
}

export default function VerifyCode({ onClose }: props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [sureMessage, setSureMessage] = useState(false);
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = values.join("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newValues = [...values];
    newValues[index] = val.slice(-1);

    setValues(newValues);

    if (val.length === 1 && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && values[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const newValues = [...values];
      newValues[index - 1] = "";
      setValues(newValues);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const pasteArr = paste.split("");
    const newValues = [...values];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pasteArr[i] || "";
    }
    setValues(newValues);

    const lastIndex = pasteArr.length >= 6 ? 5 : pasteArr.length;
    inputsRef.current[lastIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await instance.post("/");
      if (response.status === 200) {
        toast.success("User signed up and verified!");
        setValues(Array(6).fill(""));
        router.push("/signin");
      } else {
        toast.error("Verification incomplete");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSureMessage(false);
    onClose();
  };

  return (
    <>
      {!sureMessage && (
        <motion.div
          initial={{ opacity: 0, y: -300 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -300 }}
          className="w-full h-screen fixed top-0 left-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md"
        >
          <div className="bg-white shadow-xl p-6 rounded-3xl space-y-8 border border-gray-200 relative w-[95%] lg:w-[80%] xl:w-1/2">
            <FaTimes
              onClick={() => setSureMessage(true)}
              className="size-6 text-red-400 hover:text-red-600 hover:Scale-110 cursor-pointer ml-auto duration-300"
            />
            <h1 className="text-center text-2xl font-light pb-1 border-b border-primary-blue w-fit mx-auto">
              Verify Email
            </h1>
            <p className="text-[14px] text-icon-color font-light w-full lg:w-3/4 text-center mx-auto">
              To complete the account creation process, you must enter the code
              that was sent to the email address you used to register.
            </p>
            <form
              onSubmit={handleVerify}
              className="h-fit flex flex-col items-center justify-center space-y-8  "
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-4"
              >
                {values.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      if (el) {
                        inputsRef.current[idx] = el;
                      }
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="lg:w-14 lg:h-14 w-10 h-10 text-center text-lg rounded-xl border border-gray-300  bg-neutral-100  text-black  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    value={val}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    autoComplete="one-time-code"
                  />
                ))}
              </motion.div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 w-full rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: "360deg" }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <VscLoading />
                  </motion.div>
                ) : (
                  <p>Verify Email</p>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}

      {sureMessage && (
        <motion.div
          initial={{ opacity: 0, y: -300 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -300 }}
          className="w-full h-screen fixed top-0 left-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-md"
        >
          <div className="lg:w-1/2 w-[80%] bg-white flex flex-col gap-4 items-center py-6 px-2 rounded-md">
            <PiWarningOctagon className="size-12 text-red-400" />
            <p className="text-icon-color">
              Are you sure your account will be deactivated?
            </p>
            <div className="flex items-center flex-wrap gap-2 w-full">
              <button
                onClick={handleCancel}
                className="bg-primary-blue text-white px-8 py-3 w-full rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
              >
                ok
              </button>
              <button
                onClick={() => setSureMessage(false)}
                className="bg-red-400 text-white px-8 py-3 w-full rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
