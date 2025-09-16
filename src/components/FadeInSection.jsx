import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export const FadeInSection = React.memo(
  ({ children, delay = 0, alwaysTrigger }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
      triggerOnce: alwaysTrigger ? false : true,
      threshold: 0.1, // Reduced threshold for earlier trigger
      rootMargin: "50px 0px", // Trigger before element enters viewport
    });

    useEffect(() => {
      if (inView) {
        controls.start("visible");
      } else {
        controls.set("hidden");
      }
    }, [controls, inView]);

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: {
            opacity: 0,
            y: 20,
            transition: {
              duration: 0.1,
            },
          },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1], // Custom easing
              delay: delay,
            },
          },
        }}
      >
        {children}
      </motion.div>
    );
  }
);

FadeInSection.displayName = "FadeInSection";
