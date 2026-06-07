"use client";
import React, { ChangeEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiSend,
  FiUser,
  FiMessageSquare,
} from "react-icons/fi";
import { toast } from "sonner";
import Img from "../../_global/Img";
import {
  sanitizeContactDraft,
  useSubmitContact,
  validateContactDraft,
} from "@/src/modules/contact";

export default function ContactSection() {
  const { mutateAsync: submitContact, isPending } = useSubmitContact();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const offices = [
    {
      country: "North America",
      title: "New York Experience Center",
      address: "205 Middle Road, 2nd Floor, New York",
      phone: "+1 1234 567 88",
      email: "ny.support@cypher.tech",
      color: "var(--primary-blue)",
    },
    {
      country: "Europe",
      title: "London Tech Hub",
      address: "79 Manor Way, 2nd Floor, Great Fransham",
      phone: "+44 1234 567 88",
      email: "uk.support@cypher.tech",
      color: "var(--primary)",
    },
    {
      country: "Priority Support",
      title: "Global Enterprise Desk",
      address: "Holstenwall 86, Sachsen-Anhalt, Zschornewitz",
      phone: "+49 1234 567 88",
      email: "vip.desk@cypher.tech",
      color: "var(--primary-yellow)",
    },
  ];

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    const draft = {
      fullName: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    const errors = validateContactDraft(draft);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const sanitized = sanitizeContactDraft(draft);
      await submitContact(sanitized);
      toast.success(
        "Inquiry submitted successfully! We'll get back to you within 24 hours.",
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to submit inquiry. Please try again later.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="py-12 bg-white">
      <div className="w-full">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Offices and Description */}
          <div className="space-y-6">
            {/* Offices Grid */}
            <motion.div className="grid gap-4" variants={itemVariants}>
              {offices.map((office, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-md p-6 shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300"
                  whileHover={{
                    scale: 1.01,
                  }}
                  variants={itemVariants}
                >
                  <div className="space-y-4">
                    {/* Country Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: office.color }}
                      ></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-icon-color">
                        {office.country}
                      </span>
                    </div>

                    {/* Office Title */}
                    <h4 className="text-lg font-bold text-dark-btn mb-1">
                      {office.title}
                    </h4>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <FiMapPin
                          className="text-primary-blue mt-1 shrink-0"
                          size={14}
                        />
                        <p className="text-icon-color text-sm leading-relaxed">
                          {office.address}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <FiPhone
                            className="text-primary-blue shrink-0"
                            size={14}
                          />
                          <a
                            href={`tel:${office.phone}`}
                            className="text-dark-btn font-medium hover:text-primary-blue transition-colors text-sm"
                          >
                            {office.phone}
                          </a>
                        </div>

                        <div className="flex items-center gap-3">
                          <FiMail
                            className="text-primary-blue shrink-0"
                            size={14}
                          />
                          <a
                            href={`mailto:${office.email}`}
                            className="text-primary hover:text-primary-blue transition-colors font-medium text-sm"
                          >
                            {office.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Description Text */}
            <motion.div
              className="bg-gray-50 rounded-md p-8 border border-gray-100"
              variants={itemVariants}
            >
              <div className="space-y-4 text-dark-btn/80 leading-relaxed italic font-light">
                <p className="text-lg">
                  "Our mission is to bridge the gap between innovation and the
                  end-user. Whether it's a software glitch or a hardware
                  inquiry, our engineers are here to provide the clarity you
                  deserve."
                </p>
                <p className="text-sm font-bold text-primary-blue uppercase tracking-widest not-italic">
                  — The CYPHER Technical Team
                </p>
              </div>
            </motion.div>

            {/* Image Section */}
            <motion.div
              className="rounded-md overflow-hidden shadow-lg aspect-video"
              variants={itemVariants}
            >
              <Img
                src="/images/contact-img.webp"
                alt="CYPHER Flagship Tech Lab"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Right Column - Contact Form */}
          <motion.div
            className="bg-white rounded-md p-10 shadow-lg border border-gray-100 lg:sticky lg:top-8"
            variants={itemVariants}
          >
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-3">
                <motion.h2
                  className="text-3xl font-bold text-dark-btn"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Message Support
                </motion.h2>
                <div className="h-1 w-12 bg-primary-yellow rounded-full"></div>
                <motion.p
                  className="text-icon-color leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Expect a response from our technical specialists within 24
                  business hours.
                </motion.p>
              </div>

              {/* Contact Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-dark-btn">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue"
                        size={16}
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full outline-none pl-10 pr-4 py-4 border border-gray-100 rounded-md focus:border-primary-blue transition-all bg-gray-50 text-dark-btn text-sm"
                        placeholder="e.g. Alan Turing"
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-dark-btn">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-blue"
                        size={16}
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full outline-none pl-10 pr-4 py-4 border border-gray-100 rounded-md focus:border-primary-blue transition-all bg-gray-50 text-dark-btn text-sm"
                        placeholder="name@email.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark-btn">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full outline-none px-4 py-4 border border-gray-100 rounded-md focus:border-primary-blue transition-all bg-gray-50 text-dark-btn text-sm"
                    placeholder="What can we help you with?"
                  />
                  {formErrors.subject && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.subject}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-dark-btn">
                    Description
                  </label>
                  <div className="relative">
                    <FiMessageSquare
                      className="absolute left-3 top-4 text-primary-blue"
                      size={16}
                    />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full outline-none pl-10 pr-4 py-4 border border-gray-100 rounded-md focus:border-primary-blue transition-all bg-gray-50 text-dark-btn text-sm resize-none"
                      placeholder="Please provide as much detail as possible..."
                    />
                    {formErrors.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.message}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-dark-btn hover:bg-primary-blue text-white font-bold py-5 px-8 rounded-full shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <span className="uppercase tracking-widest text-sm">
                        Deploy Inquiry
                      </span>
                      <FiSend size={18} className="text-primary-yellow" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
