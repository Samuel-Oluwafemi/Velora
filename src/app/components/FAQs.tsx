import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
export const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What is your return policy?",
      answer:
        "We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Please contact our support team to initiate a return.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary based on location. Please refer to our shipping information page for details.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order is shipped, you will receive a tracking number via email. You can use this number to track your package on the carrier's website.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and Apple Pay.",
    },
  ];

  return (
    <div id="faqs" className="bg-background min-h-screen">
      <div className="pt-2 md:pt-1 pb-10 border-b border-border text-center px-3 md:px-12 max-w-screen-xl mx-auto">
        <h1
          className="text-foreground"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 300,
          }}
        >
          Frequently Asked Questions
        </h1>
        <p
          className="text-muted-foreground mt-4"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "1rem",
            maxWidth: "40ch",
            margin: "0 auto",
          }}
        >
          Find answers to common questions about our products, shipping,
          returns, and more.
        </p>

        {/* FAQ items would be rendered here */}
        <div className="max-w-screen-md mx-auto mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-background cursor-pointer rounded-xl border-2 border-gray-200
              overflow-hidden hover:bg-white transition duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full py-4 px-3 flex items-center justify-between w-full text-left"
              >
                <h2
                  className="text-foreground text-lg"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                  }}
                >
                  {faq.question}
                </h2>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown className="w-5 h-5 inline-block" />
                </motion.div>
              </button>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p
                  className="text-muted-foreground mt-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.95rem",
                  }}
                >
                  <div className="px-6 bg-white py-4 bg-background border-t-1 border-white">
                    {faq.answer}
                  </div>
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
