import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  description?: string;
}

function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendType = "neutral",
  description,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={20} strokeWidth={2} />
        </div>

        {trend && (
          <div className={`stat-trend ${trendType}`}>
            {trendType === "up" && <TrendingUp size={14} />}
            {trendType === "down" && <TrendingDown size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="stat-card-content">
        <span className="stat-title">{title}</span>

        <div className="stat-value">
          <strong>{value}</strong>
          {unit && <span>{unit}</span>}
        </div>

        {description && (
          <span className="stat-description">{description}</span>
        )}
      </div>
    </div>
  );
}

export default StatCard;