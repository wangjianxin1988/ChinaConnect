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
      <div class="loading-fullpage">
        <div class={`spinner spinner-${size}`} />
        {text && <p class="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div class="loading-inline">
      <div class={`spinner spinner-${size}`} />
      {text && <p class="loading-text">{text}</p>}
    </div>
  );
}
