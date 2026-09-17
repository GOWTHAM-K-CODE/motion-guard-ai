interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  pulse?: boolean;
}

function StatusBadge({
  status,
  variant = "neutral",
  pulse = false,
}: StatusBadgeProps) {
  return (
    <span className={`status-badge ${variant}`}>
      {pulse && <span className="status-pulse" />}
      {status}
    </span>
  );
}

export default StatusBadge;