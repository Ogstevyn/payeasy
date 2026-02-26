import type { SVGProps } from "react";

type PayEasyMarkProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function PayEasyMark({ title, ...props }: PayEasyMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {title ? <title>{title}</title> : null}
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <path d="M9 16V8H13.5C15.1569 8 16.5 9.34315 16.5 11C16.5 12.6569 15.1569 14 13.5 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
