import { forwardRef } from "react";
import Link, { LinkProps } from "next/link";

// Componente Custom para adaptar el Link de Next.js con ref para Material UI
const CustomLink = forwardRef<HTMLAnchorElement, LinkProps>(function CustomLink(
  props,
  ref
) {
  return (
    <Link {...props} passHref legacyBehavior>
      <a ref={ref} {...props} />
    </Link>
  );
});

export default CustomLink;
