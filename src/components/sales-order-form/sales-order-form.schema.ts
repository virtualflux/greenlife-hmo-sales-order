import { z } from "zod";

export const validationSchema = z.object({
  description: z.string().min(1, "Description is required"),
  date: z
    .union([z.date(), z.string()])
    .refine((val) => new Date(val).toString() !== "Invalid Date", {
      error: "Invalid date",
    }),
  location: z.string().min(1, "Location is required"),
  customer: z.string().min(1, "Customer is required"),
  drugs: z
    .array(
      z.object({
        name: z.string().min(1, "Drug name is required"),
        id: z.string().min(1, "Drug ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0.01, "Price must be greater than 0"),
      })
    )
    .min(1, "At least one drug should be selected"),
});
