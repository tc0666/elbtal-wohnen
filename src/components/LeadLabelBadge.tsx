import React from "react";
import { Badge } from "@/components/ui/badge";

interface LeadLabelBadgeProps {
  label: string | null | undefined;
  className?: string;
}

// Only VIP is colored; others remain neutral outline
const labelClassMap: Record<string, string> = {
  "VIP": "bg-primary text-primary-foreground border-transparent",
};

const LeadLabelBadge: React.FC<LeadLabelBadgeProps> = ({ label, className }) => {
  if (!label) {
    return <Badge variant="outline" className={className}>Ohne Label</Badge>;
  }

  const themed = labelClassMap[label] || "";

  return (
    <Badge variant="outline" className={["px-2 py-0.5", themed, className].filter(Boolean).join(" ")}>{label}</Badge>
  );
};

export default LeadLabelBadge;
