import { SmartLink, Spacer } from "@/components";
import { socialLinks } from "@/lib/content/social";

export const Footer = () => {
  return (
    <footer className="border-t">
      <Spacer size="lg" />
      <div className="space flex items-center space-x-lg text-gray-light">
        {socialLinks.map((link) => (
          <SmartLink key={link.href} href={link.href}>
            {link.title}
          </SmartLink>
        ))}
      </div>
      <Spacer size="lg" />
    </footer>
  );
};
