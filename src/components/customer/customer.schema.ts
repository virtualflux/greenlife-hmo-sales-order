import { z } from "zod";
export const contactPersonSchema = z.object({
  first_name: z
    .string({ message: "First name is required" })
    .max(50, "First name must be 50 characters or less")
    .optional(),
  last_name: z
    .string({ message: "Last name is required" })
    .max(50, "Last name must be 50 characters or less")
    .optional(),
  email: z.email("Invalid email address").optional(),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional(),
  is_primary_contact: z.boolean().default(true),
});

export const customerSchema = z.object({
  //   contact_type: z.string(),
  // customer_sub_type: z.enum(["individual", "business", "other"], {
  //   errorMap: () => ({ message: "Customer sub type is required" }),
  // }),
  contact_persons: z
    .array(contactPersonSchema)
    .min(1, "At least one contact person is required"),
  company_name: z
    .string({ message: "Company name is required" })
    .max(100, "Company name must be 100 characters or less")
    .optional(),
  billing_address: z
    .string()
    .min(5, { message: "Address too short" })
    .optional(),
  nextOfKin: z.string().optional(),
  contact_name: z
    .string({ message: "Please enter a customer name" })
    .min(1, "Contact name is required")
    .max(100, "Contact name must be 100 characters or less"),
});
//   .refine(
//     (data) => {
//       if (data.customer_sub_type === "business" && !data.company_name) {
//         return false;
//       }
//       return true;
//     },
//     {
//       message: "Company name is required for business customers",
//       path: ["company_name"],
//     }
//   );
