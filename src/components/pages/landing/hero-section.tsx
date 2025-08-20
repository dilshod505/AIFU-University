import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import Image from "next/image";
import heroBg from "../../../../public/landing-bg.jpg";

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32">
      <Image
        src={heroBg || "/placeholder.svg"}
        alt={"bg"}
        draggable={false}
        className={"absolute inset-0 w-full h-full object-cover z-0"}
      />
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white/20 backdrop-blur-sm dark:bg-white/10 rounded-full border border-white/30">
              <BookOpen className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
          </div>

          <TypingAnimation
            startOnView={true}
            className={"text-3xl text-white font-bold drop-shadow-lg"}
          >
            Discover Your Next
          </TypingAnimation>
          <span className="text-cyan-300 block drop-shadow-lg">
            <TypingAnimation startOnView={true} as={"h1"} className="font-bold">
              Great Read
            </TypingAnimation>
          </span>

          <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            <TextAnimate animation="blurInUp" as="h1">
              Explore a curated selection of books across all genres. From
              bestsellers to hidden gems, find your perfect literary companion.
            </TextAnimate>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/50 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 bg-white/10"
            >
              Browse Categories
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-20 dark:opacity-10 z-10">
        <div className="w-32 h-32 bg-cyan-800 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 right-10 opacity-20 dark:opacity-10 z-10">
        <div className="w-40 h-40 bg-orange-500 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
