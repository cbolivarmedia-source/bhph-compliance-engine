import { z } from 'zod';

export const dealInputSchema = z.object({
  stateCode: z.string().length(2),
  salePrice: z.number().positive(),
  downPayment: z.number().min(0),
  apr: z.number().min(0).max(100),
  termMonths: z.number().int().positive().max(120),
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 2),
}).refine(data => data.downPayment < data.salePrice, {
  message: 'Down payment must be less than sale price',
});

export type DealInputForm = z.infer<typeof dealInputSchema>;
