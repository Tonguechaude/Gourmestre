import React from "react";
import { cn } from "../../utils/cn";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  variant?:
    | "display"
    | "heading-1"
    | "heading-2"
    | "heading-3"
    | "body"
    | "body-sm"
    | "caption";
  children: React.ReactNode;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, as, variant = "body", children, ...props }, ref) => {
    // Auto-map semantic elements to variants if not specified
    const Component = as || getDefaultElement(variant);

    const variantClasses = {
      display: "text-display",
      "heading-1": "text-heading-1",
      "heading-2": "text-heading-2",
      "heading-3": "text-heading-3",
      body: "text-body",
      "body-sm": "text-body-sm",
      caption: "text-caption",
    };

    return React.createElement(
      Component,
      {
        ref,
        className: cn(variantClasses[variant], className),
        ...props,
      },
      children,
    );
  },
);

Typography.displayName = "Typography";

// Helper function to map variants to semantic elements
function getDefaultElement(variant: TypographyProps["variant"]): string {
  switch (variant) {
    case "display":
      return "h1";
    case "heading-1":
      return "h1";
    case "heading-2":
      return "h2";
    case "heading-3":
      return "h3";
    case "body":
    case "body-sm":
      return "p";
    case "caption":
      return "span";
    default:
      return "p";
  }
}

// Predefined components for common use cases
const Display = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => (
  <Typography ref={ref} as="h1" variant="display" {...props} />
));
Display.displayName = "Display";

const Heading1 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => (
  <Typography ref={ref} as="h1" variant="heading-1" {...props} />
));
Heading1.displayName = "Heading1";

const Heading2 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => (
  <Typography ref={ref} as="h2" variant="heading-2" {...props} />
));
Heading2.displayName = "Heading2";

const Heading3 = React.forwardRef<
  HTMLHeadingElement,
  Omit<TypographyProps, "variant">
>((props, ref) => (
  <Typography ref={ref} as="h3" variant="heading-3" {...props} />
));
Heading3.displayName = "Heading3";

const Body = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} as="p" variant="body" {...props} />);
Body.displayName = "Body";

const BodySmall = React.forwardRef<
  HTMLParagraphElement,
  Omit<TypographyProps, "variant">
>((props, ref) => <Typography ref={ref} as="p" variant="body-sm" {...props} />);
BodySmall.displayName = "BodySmall";

const Caption = React.forwardRef<
  HTMLSpanElement,
  Omit<TypographyProps, "variant">
>((props, ref) => (
  <Typography ref={ref} as="span" variant="caption" {...props} />
));
Caption.displayName = "Caption";

export {
  Typography,
  Display,
  Heading1,
  Heading2,
  Heading3,
  Body,
  BodySmall,
  Caption,
};
export type { TypographyProps };
