import Image from "next/image";
import heroBg from "../../../../public/landing-bg.jpg";

export function HeroSection() {
  return (
    <Image
      src={heroBg || "/placeholder.svg"}
      alt={"bg"}
      priority
      draggable={false}
      className={"inset-0 w-full h-[700px] object-cover z-0 bg-background"}
    />
  );
}
