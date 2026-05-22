"use client";
import { motion } from "framer-motion";
import SignupHeader from "./_signupPage/SignupHeader";
import SocialSignup from "./_signupPage/SocialSignup";
import SignupForm from "./_signupPage/SignupForm";
import SignupFooter from "./_signupPage/SignupFooter";
import SignupBackground, {
  SignupSideImage,
} from "./_signupPage/SignupBackground";

export default function SignUpComponent() {
  return (
    <div className=" c-container  flex min-h-[86vh] items-center justify-center  relative overflow-hidden">
      <SignupBackground />

      <div className="flex max-lg:max-w-xl mt-10 items-start h-[70vh] lg:h-[75vh] border border-gray-200 rounded-lg shadow-lg w-full ">
        {/* form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-6 max-lg:bg-white flex-1 xl:w-1/2 relative z-10 max-lg:border max-lg:border-gray-200 max-lg:rounded-lg max-lg:shadow-lg"
        >
          <SignupHeader />

          <SocialSignup />

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                or Sign up with new account
              </span>
            </div>
          </div>

          <SignupForm />

          <SignupFooter />
        </motion.div>

        <SignupSideImage />
      </div>
    </div>
  );
}
