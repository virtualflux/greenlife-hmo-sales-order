"use client";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import axios from "axios";
import { toast } from "react-toastify";
import { contactPersonSchema, customerSchema } from "./customer.schema";
import SearchableDropdown from "../utils/SearchAbleDropdown";
import { ICustomers } from "@/types/customers.type";
import { Contact } from "@/types/get-zoho-inventory-customer.type";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const CUSTOMER_SUB_TYPES = [
  { name: "Individual", value: "individual" },
  { name: "Business", value: "business" },
];

type ContactPersonType = z.infer<typeof contactPersonSchema>;

type CustomerType = z.infer<typeof customerSchema>;

type ContactPersonField = keyof ContactPersonType;

const Customer = ({
  value,
  handleSelectCustomer,
  customerType,
}: {
  value: string;

  customerType: "private" | "hmo";
  handleSelectCustomer: (
    val: string,
    customerType: "private" | "hmo",
    name: string
  ) => void;
}) => {
  const [createCustomer, setCreateCustomer] = useState(false);
  const [newValue, setNewValue] = useState(value);

  const getCustomers = async () => {
    let availableContacts: Pick<
      ICustomers,
      "zohoInventoryCustomerId" | "providerName"
    >[] = [];
    const customersTracker: Record<string, number> = {};
    const response = await axios.get<{ customers: ICustomers[] }>(
      "/api/db/customer"
    );
    if (response?.data) {
      response.data.customers.forEach((customer) => {
        customersTracker[customer.zohoInventoryCustomerId] = customersTracker[
          customer.zohoInventoryCustomerId
        ]
          ? customersTracker[customer.zohoInventoryCustomerId] + 1
          : 1;
        return {
          zohoInventoryCustomerId: customer.zohoInventoryCustomerId,
          providerName: customer.providerName,
        };
      });
    }
    const inventoryContactRes = await axios.get<Contact[]>(
      "/api/zoho/contacts"
    );
    if (inventoryContactRes.data) {
      availableContacts = inventoryContactRes.data.map((contact) => {
        customersTracker[contact.contact_id] = customersTracker[
          contact.contact_id
        ]
          ? customersTracker[contact.contact_id] + 1
          : 1;
        return {
          zohoInventoryCustomerId: contact.contact_id.toString(),
          providerName: contact.company_name,
        };
      });
    }

    // TODO: DEACTIVATE CUSTOMERS IN DATABASE THAT ARE NOT IN ZOHO INVENTORY
    const shouldDeleteIds = Object.entries(customersTracker)
      .map(([key, value]) => {
        if (value == 1) return key;
      })
      .filter((item) => !!item);
    console.log({ shouldDeleteIds });

    if (shouldDeleteIds.length) {
      await axios.delete("/api/db/customer", {
        data: { deleteIds: shouldDeleteIds },
      });
    }

    return availableContacts;
  };
  const {
    data: customers,
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });
  const formik = useFormik<CustomerType>({
    initialValues: {
      contact_persons: [
        {
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          is_primary_contact: true,
        },
      ],
      company_name: "",
      contact_name: "",
      billing_address: "",
      nextOfKin: "",
    },
    validationSchema: toFormikValidationSchema(customerSchema),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const data = {
          ...values,
          customerType,
          contact_persons: values.contact_persons.map((person) => ({
            ...person,
            ...(person.phone ? { phone: person.phone } : {}),
            ...(person.email ? { email: person.email } : {}),
          })),
          custom_fields: [],
        };
        console.log("Submitting customer values:", data);
        if (values.nextOfKin) {
          data.custom_fields = [
            {
              label: "",
              value: values.nextOfKin,
            },
          ] as any;
        }

        delete data.nextOfKin;

        await axios
          .post("/api/zoho/contacts", data)
          .then((res) => {
            console.log(res);

            handleSelectCustomer(
              res.data?.contact_id,
              customerType,
              res.data?.contact_name
            );
            setNewValue(res.data.contact_id);
            setCreateCustomer(false);
            refetch();

            toast.success("Customer added successfully");
          })
          .catch((error) => {
            if (axios.isAxiosError(error)) {
              const message = error.response?.data?.message || error.message;
              toast.error(message);
              return;
            }
            toast.error("Could not submit form , Please try again");
          });

        resetForm();
      } catch (error) {
        console.error("Error creating customer:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // const addContactPerson = () => {
  //     formik.setFieldValue('contact_persons', [
  //         ...formik.values.contact_persons,
  //         { first_name: '', last_name: '', email: '', phone: '' }
  //     ]);
  // };

  // const removeContactPerson = (index: number) => {
  //     const contacts = [...formik.values.contact_persons];
  //     contacts.splice(index, 1);
  //     formik.setFieldValue('contact_persons', contacts);
  // };

  useEffect(() => {
    setNewValue(value);
  }, [value]);

  const handleContactPersonChange = <K extends ContactPersonField>(
    index: number,
    field: K,
    value: ContactPersonType[K]
  ) => {
    const contacts = [...formik.values.contact_persons];
    contacts[index][field] = value;
    formik.setFieldValue("contact_persons", contacts);
  };

  return (
    <>
      <div className="w-full">
        <SearchableDropdown
          value={newValue}
          data={
            customers
              ? customers?.map((customer) => ({
                  name: customer.providerName?.toUpperCase(),
                  value: customer.zohoInventoryCustomerId,
                }))
              : []
          }
          onSelect={(value) =>
            handleSelectCustomer(value.value, customerType, value.name)
          }
          placeholder="Select Customer"
        />
        <p className=" text-center">OR</p>
        <button
          type="button"
          className=" border rounded-md border-zinc-700 text-sm p-1 w-full"
          onClick={() => setCreateCustomer((prev) => !prev)}
        >
          <span className=" text-xl mr-2">
            <i className="fi fi-sr-plus"></i>
          </span>
          Add new customer
        </button>
      </div>

      {createCustomer && (
        <>
          <div className="fixed z-10 inset-0 bg-black/20"></div>
          <div className="bg-white text-sm fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-70 overflow-y-auto h-[85vh] w-full max-w-[320px] shadow-lg rounded-md text-black">
            <button
              onClick={() => setCreateCustomer(false)}
              type="button"
              className=" rounded-md bg-gray-400 w-10 h-10 p-2 left-[80%] top-1 text-white text-xl font-semiBold shadow-md sticky border z-80"
            >
              <i className="fi fi-sr-cross"></i>
            </button>
            <div className="bg-white rounded-xl  p-6 md:p-8 ">
              <div className="mb-8">
                <h1 className="text-2xl text-center font-bold text-gray-800 mb-2">
                  Create Customer
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="col-span-full">
                  <label
                    htmlFor="contact_name"
                    className=" block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contact Name{" "}
                    <span className=" text-red-500 text-xs inline-block ml-1">
                      *
                    </span>
                  </label>
                  <input
                    id="contact_name"
                    name="contact_name"
                    type="text"
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (customerType == "private") {
                        formik.setFieldValue("company_name", e.target.value);
                      }
                    }}
                    value={formik.values.contact_name}
                    className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                      formik.touched.contact_name && formik.errors.contact_name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Display name for contact on zoho books..."
                  />
                  {formik.touched.contact_name && formik.errors.contact_name ? (
                    <div className="mt-1 text-sm text-red-600">
                      {formik.errors.contact_name}
                    </div>
                  ) : null}
                </div>
                {customerType == "hmo" && (
                  <div className="col-span-full">
                    <label
                      htmlFor="company_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Company Name{" "}
                      <span className=" text-red-500 text-xs inline-block ml-1">
                        *
                      </span>
                    </label>
                    <input
                      id="company_name"
                      name="company_name"
                      type="text"
                      onChange={formik.handleChange}
                      value={formik.values.company_name}
                      className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                        formik.touched.company_name &&
                        formik.errors.company_name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., ABC Corporation"
                    />
                    {formik.touched.company_name &&
                    formik.errors.company_name ? (
                      <div className="mt-1 text-sm text-red-600">
                        {formik.errors.company_name}
                      </div>
                    ) : null}
                  </div>
                )}
                {customerType == "private" && (
                  <>
                    <div className="col-span-full">
                      <label
                        htmlFor="billing_address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address
                      </label>
                      <input
                        id="billing_address"
                        name="billing_address"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.billing_address}
                        className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                          formik.touched.billing_address &&
                          formik.errors.billing_address
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="e.g., 123, address street"
                      />
                      {formik.touched.billing_address &&
                      formik.errors.billing_address ? (
                        <div className="mt-1 text-sm text-red-600">
                          {formik.errors.billing_address}
                        </div>
                      ) : null}
                    </div>
                    <div className="col-span-full">
                      <label
                        htmlFor="nextOfKin"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Next Of Kin
                      </label>
                      <input
                        id="nextOfKin"
                        name="nextOfKin"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.nextOfKin}
                        className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                          formik.touched.nextOfKin && formik.errors.nextOfKin
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {formik.touched.nextOfKin && formik.errors.nextOfKin ? (
                        <div className="mt-1 text-sm text-red-600">
                          {formik.errors.nextOfKin}
                        </div>
                      ) : null}
                    </div>
                  </>
                )}

                <div className="col-span-full">
                  {formik.values.contact_persons.map((person, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-4"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        {/* First Name Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name{" "}
                            {/* <span className="text-red-500 text-xs inline-block ml-1">
                            *
                          </span> */}
                          </label>
                          <input
                            type="text"
                            value={person.first_name}
                            onChange={(e) =>
                              handleContactPersonChange(
                                index,
                                "first_name",
                                e.target.value
                              )
                            }
                            className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                              formik.touched.contact_persons?.[index]
                                ?.first_name &&
                              //@ts-ignore
                              formik.errors.contact_persons?.[index]?.first_name
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="First name"
                          />
                          {formik.touched.contact_persons?.[index]
                            ?.first_name &&
                            //@ts-ignore
                            (formik.errors.contact_persons as any)?.[index]
                              ?.first_name && (
                              <div className="mt-1 text-sm text-red-600">
                                {
                                  //@ts-ignore
                                  (formik.errors.contact_persons as any)[index]
                                    ?.first_name
                                }
                              </div>
                            )}
                        </div>

                        {/* Last Name Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                            {/* <span className="text-red-500 text-xs inline-block ml-1">
                            *
                          </span> */}
                          </label>
                          <input
                            type="text"
                            value={person.last_name}
                            onChange={(e) =>
                              handleContactPersonChange(
                                index,
                                "last_name",
                                e.target.value
                              )
                            }
                            className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                              formik.touched.contact_persons?.[index]
                                ?.last_name &&
                              //@ts-ignore
                              formik.errors.contact_persons?.[index]?.last_name
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Last name"
                          />
                          {formik.touched.contact_persons?.[index]?.last_name &&
                            //@ts-ignore
                            (formik.errors.contact_persons as any)?.[index]
                              ?.last_name && (
                              <div className="mt-1 text-sm text-red-600">
                                {
                                  //@ts-ignore
                                  formik.errors.contact_persons[index].last_name
                                }
                              </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={person.email}
                            onChange={(e) =>
                              handleContactPersonChange(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                            className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                              formik.touched.contact_persons?.[index]?.email &&
                              //@ts-ignore
                              formik.errors.contact_persons?.[index]?.email
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="email@example.com"
                          />
                          {formik.touched.contact_persons?.[index]?.email &&
                            //@ts-ignore
                            formik.errors.contact_persons?.[index]?.email && (
                              <div className="mt-1 text-sm text-red-600">
                                {
                                  //@ts-ignore
                                  formik.errors.contact_persons[index].email
                                }
                              </div>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            value={person.phone}
                            onChange={(e) =>
                              handleContactPersonChange(
                                index,
                                "phone",
                                e.target.value
                              )
                            }
                            className={`w-full p-2 border rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 ${
                              //@ts-ignore
                              formik.touched.contact_persons?.[index]?.phone &&
                              //@ts-ignore
                              formik.errors.contact_persons?.[index]?.phone
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="+2348201234567"
                          />
                          {formik.touched.contact_persons?.[index]?.phone &&
                            //@ts-ignore
                            formik.errors.contact_persons?.[index]?.phone && (
                              <div className="mt-1 text-sm text-red-600">
                                {
                                  //@ts-ignore
                                  formik.errors.contact_persons[index].phone
                                }
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {formik.touched.contact_persons &&
                    typeof formik.errors.contact_persons === "string" && (
                      <div className="mt-1 text-sm text-red-600">
                        {formik.errors.contact_persons}
                      </div>
                    )}
                </div>

                <div className="col-span-full flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => formik.handleSubmit()}
                    disabled={formik.isSubmitting}
                    className="w-full px-3 py-1.5 bg-zinc-700 border border-transparent rounded-lg text-white font-medium hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {formik.isSubmitting ? (
                      <span className="flex items-center justify-center w-full">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      "Create Customer"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Customer;
