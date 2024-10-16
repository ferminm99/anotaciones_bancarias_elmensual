import { forwardRef } from "react";
import Link, { LinkProps } from "next/link";
import { UrlObject } from "url";

// Función para manejar el tipo Url
const resolveHref = (href: string | UrlObject): string =>
  typeof href === "string" ? href : String(href);

const CustomLink = forwardRef<HTMLAnchorElement, LinkProps>(function CustomLink(
  props,
  ref
) {
  const { href, ...other } = props;
  return (
    <Link {...props} passHref legacyBehavior>
      <a ref={ref} href={resolveHref(href)} {...other} />
    </Link>
  );
});

export default CustomLink;
