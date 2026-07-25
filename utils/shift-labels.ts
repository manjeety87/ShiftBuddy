import { Shift, Workplace } from "@/types";

const getShiftWorkplaceLabel = (
  shift: Shift,
  workplaces: Workplace[],
): string => {
  if (shift.associationType === "temporary") {
    return shift.temporaryWorkplaceName?.trim() || "Temporary Shift";
  }

  if (shift.associationType === "unassigned") {
    return "Unassigned";
  }

  return (
    workplaces.find((workplace) => workplace.id === shift.workplaceId)?.name ??
    "Unknown Workplace"
  );
};

export { getShiftWorkplaceLabel };

