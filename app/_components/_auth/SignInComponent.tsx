"use client";
import { motion } from "framer-motion";
import SignInHeader from "./_signinPage/SignInHeader";
import SocialLogin from "./_signinPage/SocialLogin";
import SignInForm from "./_signinPage/SignInForm";
import SignInFooter from "./_signinPage/SignInFooter";
import SignInBackground, {
  SignInSideImage,
} from "./_signinPage/SignInBackground";

export default function SignInComponent() {
  const signInWithGoogle = () => {
    // Implement Google Sign In logic here
    console.log("Google Sign In clicked");
  };

  return (
    <div className=" c-container  flex min-h-[86vh] items-center justify-center  relative overflow-hidden">
      <SignInBackground />

      <div className="flex max-lg:max-w-xl mt-10 items-start h-[70vh] border border-gray-200 rounded-lg shadow-lg w-full ">
        {/* form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-6 max-lg:bg-white flex-1 xl:w-1/2 relative z-10 max-lg:border max-lg:border-gray-200 max-lg:rounded-lg max-lg:shadow-lg"
        >
          <SignInHeader />

          <SocialLogin />

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                or continue with email
              </span>
            </div>
          </div>

          <SignInForm />

          <SignInFooter />
        </motion.div>

        <SignInSideImage />
      </div>
    </div>
  );
}
