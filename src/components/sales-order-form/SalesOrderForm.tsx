"use client"
import React, { useState } from 'react'
import { useFormik } from 'formik';
import { SalesOrderFormInput } from '@/types/sales-order-form-input.type';
import { DateHelper } from '@/utils/date-helper';
import { Drugs } from '@/types/drugs.type';
import DrugsComponent from './Drugs';
import { AxiosService } from '@/lib/axios/axios.config';
import { useQuery, useQueryClient } from "@tanstack/react-query"

const SalesOrderForm = () => {
    const fetchLocation = () => {
        try {
            AxiosService.get(`locations?organization_id=${process.env.ZOHO_ORG_ID}`)

        } catch (error) {

            throw error
        }
    }
    const queryClient = useQueryClient()
    const query = useQuery({ queryKey: ["locations"], queryFn: fetchLocation })


    const form = useFormik<SalesOrderFormInput>({
        initialValues: {
            description: '',
            date: DateHelper.getCurrentDate({}),
            location: '',
            drugs: [],
            customer: ''
        },
        onSubmit: (value) => {
            console.log("Submitting form"),
                console.log(value)
        }
    })



    return (

        <div className="max-w-md mx-auto p-6 bg-lime rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Sales Order Form</h2>

            <form onSubmit={form.handleSubmit} className="space-y-2">
                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium ">
                        Description
                    </label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.description}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                    {form.touched.description && form.errors.description ? (
                        <div className="text-red-500 text-sm">{form.errors.description}</div>
                    ) : null}
                </div>

                {/* Date */}
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

                {/* Location */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium ">
                        Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.location}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                    {form.touched.location && form.errors.location ? (
                        <div className="text-red-500 text-sm">{form.errors.location}</div>
                    ) : null}
                </div>

                {/* Customer */}
                <div>
                    <label htmlFor="customer" className="block text-sm font-medium ">
                        Customer
                    </label>
                    <input
                        type="text"
                        id="customer"
                        name="customer"
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.customer}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                    {form.touched.customer && form.errors.customer ? (
                        <div className="text-red-500 text-sm">{form.errors.customer}</div>
                    ) : null}
                </div>

                {/* Drugs */}
                <DrugsComponent form={form} />

                {/* Submit button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Submit Order
                    </button>
                </div>
            </form>
        </div>
    )
}

export default SalesOrderForm