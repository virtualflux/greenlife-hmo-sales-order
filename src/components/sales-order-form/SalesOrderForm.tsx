"use client"
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import { SalesOrderFormInput } from '@/types/sales-order-form-input.type';
import { DateHelper } from '@/utils/helper/date-helper';
import { Drugs } from '@/types/drugs.type';
import DrugsComponent from './Drugs';
import { AxiosService } from '@/lib/axios/axios.config';
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from 'axios';
import { LocationData } from '@/types/locations.type';
import { ICustomers } from '@/types/customers.type';
import SearchableDropdown from '../utils/SearchAbleDropdown';
import { CreateSalesOrder, CustomField } from '@/types/zoho-inventory-create-so.type';
import { toast } from 'react-toastify';
import { Contact } from '@/types/get-zoho-inventory-customer.type';
import useGetAllContacts from '@/utils/query/get-all-customers-hook.query';

const SalesOrderForm = () => {

    const getLocation = async () => {
        const response = await axios.get<LocationData>('/api/zoho/location')
        return (response).data.locations ?? []
    }
    const locationData = useQuery({ queryKey: ["locations"], queryFn: getLocation })
    // console.log({ locationData: locationData.data?.locations })

    // const { customers, error: customerError, isLoading: customerLoading } = useGetAllContacts()

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

        //TODO: DEACTIVATE CUSTOMERS IN DATABASE THAT ARE NOT IN ZOHO INVENTORY
        // const shouldDeleteIds = Object.entries(customersTracker).map(([key, value]) => {
        //     if (value == 1) return key
        // })
        // console.log({ shouldDeleteIds })

        // console.log(customersTracker);

        return availableContacts;
    };
    const {
        data: customers,
        isLoading,
        error,
    } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });

    const form = useFormik<SalesOrderFormInput>({
        initialValues: {
            description: '',
            date: DateHelper.getCurrentDate({ asString: true }),
            location: '',
            drugs: [],
            customer: '',
            enrolleeName: "",
            enrolleeID: ""
        },
        onSubmit: (value) => {
            console.log("Submitting form"),
                console.log(value)
            handleSubmit(value).then(res => {
                console.log(res)
            }).catch(error => console.log(error)).finally(() => {
                form.resetForm()
            })
        }

    })


    const handleSubmit = async (value: SalesOrderFormInput) => {
        if (!value.customer || !value.location || !value.drugs.length) {
            console.log("Please fill in the forms")
            toast.warn("Please fill the compulsory form fields")
            return;
        }
        const { enrolleeID, enrolleeName } = value
        const customFields: CustomField[] = [{
            custom_field_id: "6544164000000575082",
            value: enrolleeName
        }, {
            custom_field_id: "6544164000000591001", value: enrolleeID
        }]
        try {
            const input: CreateSalesOrder = {
                customer_id: value.customer,
                date: value.date as string,
                location_id: value.location,
                next_action: "submit",
                line_items: value.drugs.map(item => ({
                    item_id: item.id,
                    rate: item.unit,
                    quantity: item.quantity,
                    description: item.name,
                    location_id: value.location,
                    item_total: item.price
                })),
                custom_fields: customFields

            }
            // console.log({ input })
            await axios.post("/api/zoho/sales-order", input)
            toast.success("Sales Order was created successfully", { className: "bg-green-700" })

        } catch (error: any) {
            toast.error(error?.message || "Form was not submitted", {})
            console.error(error)
        }
    }


    const handleSelectCustomer = (
        customerId: string
    ) => {
        form.setFieldValue("customer", customerId)
    }


    return (

        <div className="max-w-md mx-auto p-6 bg-primary rounded-lg shadow-md text-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-center">HMO Prescription Validation Form</h2>

            <form onSubmit={form.handleSubmit} className="space-y-2">

                <div>
                    <label htmlFor="date" className="inline-flex text-sm font-medium ">
                        Date
                        <span className=' text-sm block'><p className='text-red-800'>
                            *</p></span>
                    </label>
                    <input
                        required
                        type="date"
                        id="date"
                        name="date"
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.date as string}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                    {form.touched.date && form.errors.date ? (
                        <div className="text-red-500 text-sm">{form.errors.date as string}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="location" className="inline-flex text-sm font-medium">
                        Location
                        <span className=' text-sm block'><p className='text-red-800'>
                            *</p></span>
                    </label>
                    <select
                        required
                        id="location"
                        name="location"
                        value={form.values.location}
                        onChange={(e) => form.setFieldValue("location", e.target.value)}
                        className="mt-1 block w-full text-zinc-900 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    >
                        <option value="">Select a location</option>
                        {locationData?.data?.locations ? <>
                            {
                                locationData.data?.locations.map(location => (<option key={location.location_id} value={location.location_id}>
                                    {location.location_name}
                                </option>))}
                        </> : <option >No Location options</option>}


                    </select>


                    {form.touched.location && form.errors.location ? (
                        <div className="text-red-500 text-sm">{form.errors.location}</div>
                    ) : null}
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium ">
                        Enrollee Name
                    </label>
                    <input
                        type="text"
                        id="enrolleeName"
                        name="enrolleeName"
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.enrolleeName}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                    {form.touched.enrolleeName && form.errors.enrolleeName ? (
                        <div className="text-red-500 text-sm">{form.errors.enrolleeName as string}</div>
                    ) : null}
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium ">
                        Enrollee ID
                    </label>
                    <input
                        type="text"
                        id="enrolleeID"
                        name="enrolleeID"
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.enrolleeID}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                    {form.touched.enrolleeID && form.errors.enrolleeID ? (
                        <div className="text-red-500 text-sm">{form.errors.enrolleeID as string}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="customer" className="block text-sm font-medium ">
                        Customer
                    </label>
                    <SearchableDropdown value={form.values.customer} data={customers ? customers?.map(customer => ({ name: customer.providerName.toUpperCase(), value: customer.zohoInventoryCustomerId })) : []} onSelect={(value) => handleSelectCustomer(value.value)} placeholder='Select Customer' />
                    {form.touched.customer && form.errors.customer ? (
                        <div className="text-red-500 text-sm">{form.errors.customer}</div>
                    ) : null}
                </div>




                <DrugsComponent form={form} />

                <Link href='/contacts' className='underline'>Upload Customer Data</Link>
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-100"
                    >
                        Submit Order
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SalesOrderForm