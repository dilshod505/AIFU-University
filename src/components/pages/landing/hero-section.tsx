import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { TextAnimate } from "@/components/magicui/text-animate";
import { TypingAnimation } from "@/components/magicui/typing-animation";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-cyan-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-cyan-800/10 dark:bg-cyan-300/10 rounded-full">
              <BookOpen className="h-12 w-12 text-cyan-800 dark:text-cyan-300" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            <TypingAnimation startOnView={true} as={"h1"}>
              Discover Your Next
            </TypingAnimation>
            <span className="text-cyan-800 dark:text-cyan-300 block">
              <TypingAnimation startOnView={true} as={"h1"}>
                Great Read
              </TypingAnimation>
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
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
              className="border-2 border-cyan-800 text-cyan-800 hover:bg-cyan-800 hover:text-white dark:border-cyan-300 dark:text-cyan-300 dark:hover:bg-cyan-300 dark:hover:text-slate-900 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 bg-transparent"
            >
              Browse Categories
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-20 dark:opacity-10">
        <div className="w-32 h-32 bg-cyan-800 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 right-10 opacity-20 dark:opacity-10">
        <div className="w-40 h-40 bg-orange-500 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
