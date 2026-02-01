import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string; // For width/height control
  width?: number; // Optional numeric width
  height?: number; // Optional numeric height
}

export const Logo = ({ className, width, height }: LogoProps) => {
  return (
    <img
      src="/images/logo.png"
      alt="Brainy Platform Logo"
      className={cn("w-auto h-auto dark:invert", className)}
      width={width}
      height={height}
    />
  );
};
