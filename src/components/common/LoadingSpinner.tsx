// @ts-nocheck
// Loading Spinner Component
import "./LoadingSpinner.css";

interface Props {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ size = "md", text, fullPage = false }: Props) {
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div class={`spinner spinner-${size}`} />
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div class={`spinner spinner-${size}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
