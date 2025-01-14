import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["roommates", "friends", "community", "connections", "matches"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-10 lg:py-20 items-center justify-center flex-col">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-gray-900" />
            <span className="text-2xl font-medium text-gray-900">MateMatch</span>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-4xl md:text-6xl max-w-2xl tracking-tight text-center font-light text-gray-900">
              <span>Find your perfect</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-[#FDB241]"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-base text-gray-500 leading-relaxed tracking-tight max-w-2xl text-center mt-4">
              Join our community of students and young professionals looking for compatible roommates and meaningful connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero }; 