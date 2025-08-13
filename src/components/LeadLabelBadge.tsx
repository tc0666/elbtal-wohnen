import React from "react";
import { Badge } from "@/components/ui/badge";

interface LeadLabelBadgeProps {
  label: string | null | undefined;
  className?: string;
}

// Maps known labels to themed styles using design tokens
const labelClassMap: Record<string, string> = {
  "VIP": "bg-primary text-primary-foreground border-transparent",
  "Hot Lead": "bg-destructive text-destructive-foreground border-transparent",
  "Warm": "bg-accent text-accent-foreground border-transparent",
  "Cold": "bg-muted text-muted-foreground border-transparent",
  "Follow-Up": "bg-secondary text-secondary-foreground border-transparent",
  "Unqualified": "bg-muted text-muted-foreground border-transparent",
  "Converted": "bg-primary/10 text-primary border border-primary/20",
};

const LeadLabelBadge: React.FC<LeadLabelBadgeProps> = ({ label, className }) => {
  if (!label) {
    return <Badge variant="outline" className={className}>Ohne Label</Badge>;
  }

  const themed = labelClassMap[label] || "bg-secondary text-secondary-foreground border-transparent";

  return (
    <Badge variant="outline" className={["px-2 py-0.5", themed, className].filter(Boolean).join(" ")}>{label}</Badge>
  );
};

export default LeadLabelBadge;
