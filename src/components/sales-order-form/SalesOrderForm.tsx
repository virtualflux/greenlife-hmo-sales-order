"use client"
import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import { SalesOrderFormInput } from '@/types/sales-order-form-input.type';
import { DateHelper } from '@/utils/date-helper';
import { Drugs } from '@/types/drugs.type';
import DrugsComponent from './Drugs';
import { AxiosService } from '@/lib/axios/axios.config';
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from 'axios';
import { LocationData } from '@/types/locations.type';
import { ICustomers } from '@/types/customers.type';
import SearchableDropdown from '../utils/SearchAbleDropdown';
import { CreateSalesOrder } from '@/types/zoho-inventory-create-so.type';
import { toast } from 'react-toastify';

const SalesOrderForm = () => {

    const getLocation = async () => {
        const response = await axios.get<LocationData>('/api/zoho/location')
        return (response).data.locations ?? []
    }
    const locationData = useQuery({ queryKey: ["locations"], queryFn: getLocation })
    // console.log({ locationData: locationData.data?.locations })

    const getCustomers = async () => {
        const response = await axios.get<{ customers: ICustomers[] }>('/api/db/customer')
        return (response).data ?? []
    }
    const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: getCustomers })

    const form = useFormik<SalesOrderFormInput>({
        initialValues: {
            description: '',
            date: DateHelper.getCurrentDate({ asString: true }),
            location: '',
            drugs: [],
            customer: ''
        },
        onSubmit: (value) => {
            console.log("Submitting form"),
                console.log(value)
            handleSubmit(value).then(res => {
                console.log(res)
            }).catch(error => console.log(error))
        }

    })


    const handleSubmit = async (value: SalesOrderFormInput) => {
        if (!value.customer || !value.location || !value.drugs) {
            console.error("Please fill in the forms")
            return;
        }
        try {
            const input: CreateSalesOrder = {
                customer_id: value.customer,
                date: value.date as string,
                location_id: value.location,
                line_items: value.drugs.map(item => ({
                    item_id: item.id,
                    rate: item.unit,
                    quantity: item.quantity,
                    description: item.name,
                    location_id: value.location,
                    item_total: item.price
                }))


            }
            // console.log({ input })
            await axios.post("/api/zoho/sales-order", input)
            toast.success("Sales Order was created successfully", { className: "bg-green-700" })
            form.resetForm()
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
            <h2 className="text-2xl font-bold mb-6 text-center">Sales Order Form</h2>

            <form onSubmit={form.handleSubmit} className="space-y-2">

                <div>
                    <label htmlFor="date" className="block text-sm font-medium ">
                        Date
                    </label>
                    <input
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
                    <label htmlFor="location" className="block text-sm font-medium">
                        Location
                    </label>
                    <select
                        id="location"
                        name="location"
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
                    <label htmlFor="customer" className="block text-sm font-medium ">
                        Customer
                    </label>
                    <SearchableDropdown value={form.values.customer} data={customers ? customers?.customers.map(customer => ({ name: customer.providerName.toUpperCase(), value: customer.zohoInventoryCustomerId })) : []} onSelect={(value) => handleSelectCustomer(value.value)} placeholder='Select Customer' />
                    {form.touched.customer && form.errors.customer ? (
                        <div className="text-red-500 text-sm">{form.errors.customer}</div>
                    ) : null}
                </div>




                <DrugsComponent form={form} />

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