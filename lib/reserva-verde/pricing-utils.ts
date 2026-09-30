import { InstallmentStage, INSTALLMENT_PLAN } from "./pricing-data";

/**
 * Formats a number into Indian Rupee (INR) representation.
 * @param value The value to format.
 * @param inputUnit The unit of the input value: 'raw' (actual Rupees), 'Cr' (Crores), or 'Lakh' (Lakhs).
 * @param outputType Force output formatting to 'Cr', 'Lakh', or 'auto' (chooses Cr or Lakh based on size).
 */
export function formatINR(
  value: number,
  inputUnit: "raw" | "Cr" | "Lakh" = "Cr",
  outputType: "Cr" | "Lakh" | "auto" = "auto"
): string {
  // Convert input value to raw Rupees first
  let rawRupees = 0;
  if (inputUnit === "raw") {
    rawRupees = value;
  } else if (inputUnit === "Cr") {
    rawRupees = value * 10000000;
  } else if (inputUnit === "Lakh") {
    rawRupees = value * 100000;
  }

  const crores = rawRupees / 10000000;
  const lakhs = rawRupees / 100000;

  // Decide format based on outputType or value size
  if (outputType === "Cr" || (outputType === "auto" && rawRupees >= 10000000)) {
    // If it's a clean integer division, drop decimals, otherwise keep 2 decimals
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2);
    return `₹${formatted} Cr`;
  } else {
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2);
    return `₹${formatted} L`;
  }
}

export interface CalculatedInstallment {
  stageNumber: number;
  name: string;
  percentage: number;
  amountRaw: number; // in raw Rupees
  amountFormatted: string;
}

/**
 * Calculates installment amounts based on the sale price (in Cr).
 */
export function calculateInstallments(priceInCr: number): CalculatedInstallment[] {
  const rawPrice = priceInCr * 10000000;
  return INSTALLMENT_PLAN.map((stage) => {
    const amountRaw = (rawPrice * stage.percentage) / 100;
    return {
      stageNumber: stage.stageNumber,
      name: stage.name,
      percentage: stage.percentage,
      amountRaw,
      amountFormatted: formatINR(amountRaw, "raw", "auto"),
    };
  });
}

export interface CostingResult {
  builtUpArea: number;
  constructionRate: number;
  constructionCostRaw: number;
  externalWorksRaw: number;
  landAllocationRaw: number;
  infrastructureAllocationRaw: number;
  subtotalRaw: number;
  softCostRaw: number;
  estimatedInternalCostRaw: number;
  salePriceRaw: number;
  grossMarginRaw: number;
  grossMarginPercent: number;
}

/**
 * Performs detailed internal costing and margin calculations.
 * All dollar inputs except area and rates are in Lakhs. Sale price is in Cr.
 */
export function calculateInternalCost(
  builtUpArea: number,
  constructionRate: number,
  landAllocationLakhs: number,
  infraAllocationLakhs: number,
  externalWorksLakhs: number,
  softCostPct: number,
  salePriceCr: number
): CostingResult {
  const constructionCostRaw = builtUpArea * constructionRate;
  const externalWorksRaw = externalWorksLakhs * 100000;
  const landAllocationRaw = landAllocationLakhs * 100000;
  const infrastructureAllocationRaw = infraAllocationLakhs * 100000;
  const salePriceRaw = salePriceCr * 10000000;

  // Subtotal = Construction Cost + External Works + Land Allocation + Common Infrastructure
  const subtotalRaw =
    constructionCostRaw +
    externalWorksRaw +
    landAllocationRaw +
    infrastructureAllocationRaw;

  // Soft Cost = 12% * (Construction Cost + External Works)
  const softCostRaw = (constructionCostRaw + externalWorksRaw) * (softCostPct / 100);

  // Total internal cost
  const estimatedInternalCostRaw = subtotalRaw + softCostRaw;

  // Margin calculations
  const grossMarginRaw = salePriceRaw - estimatedInternalCostRaw;
  const grossMarginPercent = (grossMarginRaw / salePriceRaw) * 100;

  return {
    builtUpArea,
    constructionRate,
    constructionCostRaw,
    externalWorksRaw,
    landAllocationRaw,
    infrastructureAllocationRaw,
    subtotalRaw,
    softCostRaw,
    estimatedInternalCostRaw,
    salePriceRaw,
    grossMarginRaw,
    grossMarginPercent,
  };
}
