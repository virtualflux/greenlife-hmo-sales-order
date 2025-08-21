import { Drugs } from '@/types/drugs.type';
import { SalesOrderFormInput } from '@/types/sales-order-form-input.type';
import { InventoryItems, Item } from '@/types/zoho-inventory-item.type';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Formik, FormikBag, FormikHelpers, FormikProps } from 'formik';
import React, { useEffect, useState } from 'react'
import SearchableDropdown from '../utils/SearchAbleDropdown';
import { IProcedure } from '@/types/procedure.type';
import { ICustomers } from '@/types/customers.type';
import { toast } from 'react-toastify';

export interface IDrugComponent {
    form: FormikProps<SalesOrderFormInput>
}
const DrugsComponent: React.FC<IDrugComponent> = ({ form }) => {

    const [inventoryDrug, setInventoryDrug] = useState({ name: "", item_id: "" })
    const getCustomers = async () => {
        const response = await axios.get<{ customers: ICustomers[] }>('/api/db/customer')
        return (response).data ?? []
    }
    const { data: customers } = useQuery({ queryKey: ["customers"], queryFn: getCustomers })

    const getInventoryItems = async () => {

        const response = await axios.get<{ items: Item[] }>('/api/zoho/inventory-item')
        if (form.values.location) {
            return response.data.items.filter(item => {
                const pickedItemLocation = item.locations.find(loc => loc.location_id == form.values.location)
                if (pickedItemLocation) return true
                return false

            })
        }
        return response.data.items ?? []
    }
    const { data: inventoryItem, error, isLoading } = useQuery({ queryKey: ["inventory-items"], queryFn: getInventoryItems })

    const { data: drugs, isLoading: drugLoading, refetch } = useQuery({
        queryKey: ["fetch-customer-drugs"], queryFn: async () => {
            const selectedCustomer = customers?.customers.find(customer => customer.zohoInventoryCustomerId == form.values.customer)
            const res = await axios.get<IProcedure[]>(`/api/db/drugs?customer=${selectedCustomer?._id}`)
            // console.log({ data: res.data })
            return res.data ?? []
        },
        enabled: false
    })
    const [newDrug, setNewDrug] = useState<Drugs>({
        name: '',
        id: '',
        quantity: 0,
        price: 0,
        unit: 0,

    });

    const addDrug = () => {
        if (newDrug.name && newDrug.id && newDrug.quantity > 0 && newDrug.price >= 0) {
            form.setFieldValue('drugs', [...form.values.drugs, newDrug]);
            const description = form.values.description
            form.setFieldValue("description", (description ? description + "," + newDrug.name : newDrug.name))
            setNewDrug({
                name: '',
                id: '',
                quantity: 0,
                price: 0,
                unit: 0,
            });
            setInventoryDrug({ name: "", item_id: "" })
        } else {
            toast.warn("Please fill in the drug details")
        }
    };

    const removeDrug = (index: number) => {
        const newDrugs = [...form.values.drugs];
        newDrugs.splice(index, 1);
        form.setFieldValue('drugs', newDrugs);
    };

    useEffect(() => {
        if (form.values.customer) {
            refetch()
        }
    }, [form.values.customer])

    return (
        <div className="border-t pt-4 ">
            <h3 className="text-lg font-medium mb-2">Drugs</h3>

            {/* Add new drug */}
            <div className="space-y-2 mb-4 p-3 bg-[#d3d7c9] rounded text-zinc-800">
                <h4 className="font-medium">Add New Drug</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className='col-span-2'>
                        <label htmlFor="inventoryItemName" className="block text-sm font-medium ">
                            Select Item from Inventory
                        </label>
                        <SearchableDropdown value={newDrug.id} isLoading={isLoading} data={inventoryItem ? inventoryItem.map(item => ({ name: item.name, value: item.item_id })) : []} onSelect={(value) => {
                            if (!form.values.location) {
                                toast.warn("Please select a location")
                                return
                            }
                            setNewDrug({ ...newDrug, name: value.name, id: value.value })
                        }} placeholder='Select item from inventory' />

                    </div>
                    <div className='col-span-2'>
                        <label htmlFor="customerItemName" className="block text-sm font-medium ">
                            Customer Item
                        </label>
                        <SearchableDropdown value={inventoryDrug.item_id} isLoading={isLoading} data={drugs ? drugs.map(item => ({ name: item.name, value: item._id })) : []} onSelect={(value) => {
                            const selectedProcedure = drugs?.find(item => item._id == value.value)
                            setInventoryDrug({ item_id: value.value, name: value.name })
                            setNewDrug({ ...newDrug, ...(!newDrug.quantity && { quantity: 1 }), unit: ((selectedProcedure?.rate) ?? 0), price: ((selectedProcedure?.rate) ?? 0) * (newDrug.quantity || 1) })
                        }} placeholder='Select Providers procedure name' disabled={!!!form.values.customer || !!!newDrug.id} />


                    </div>

                    <div>
                        <label htmlFor="drugQuantity" className="block text-sm font-medium ">
                            Quantity
                        </label>
                        <input
                            type="number"
                            id="drugQuantity"
                            value={newDrug.quantity}
                            onChange={(e) => setNewDrug({ ...newDrug, quantity: parseInt(e.target.value || "0"), price: parseInt(e.target.value || "0") * newDrug.unit })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="drugPrice" className="block text-sm font-medium ">
                            Price
                        </label>
                        <input
                            type="number"
                            disabled
                            id="drugPrice"
                            value={newDrug.price}
                            onChange={(e) => setNewDrug({ ...newDrug, price: parseFloat(e.target.value || "0") })}
                            className="mt-1 bg-gray-300 cursor-not-allowed block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={addDrug}
                    className="mt-2 inline-flex justify-center py-1 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add Drug
                </button>
            </div>

            {/* List of added drugs */}
            {form.values.drugs.length > 0 ? (
                <div className="space-y-2 border-y-1 rounded-md p-2 shadow-2xl ">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 rounded font-medium text-sm">
                        <div className="col-span-4">Name</div>
                        {/* <div className="col-span-2 text-center">ID</div> */}
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-center">Unit Price</div>
                        <div className="col-span-2 text-center">Price</div>
                        <div className="col-span-2 text-center">Action</div>
                    </div>

                    {/* Table Rows */}
                    {form.values.drugs.map((drug, index) => (
                        <div
                            key={drug.id}
                            className=" p-3 border rounded hover:bg-gray-50 hover:text-zinc-800 transition-colors overflow-x-auto"
                        >
                            <div className='grid grid-cols-12 gap-2 items-center'>

                                <div className="col-span-4 font-medium truncate" title={drug.name}>
                                    {drug.name}
                                </div>
                                <div className="col-span-2 text-center text-sm">
                                    {drug.quantity}
                                </div>
                                <div className="col-span-2 text-center text-sm text-gray-600 truncate" title={drug.price.toString()}>
                                    ₦{drug.unit.toFixed(2)}
                                </div>
                                <div className="col-span-2 text-center text-sm font-mono">
                                    ₦{(drug.price).toFixed(2)}
                                </div>
                                <div className="col-span-2 text-center inline-block">
                                    <button
                                        type="button"
                                        onClick={() => removeDrug(index)}
                                        className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded hover:bg-red-50 hover:-ml-6 transition-all"
                                    >
                                        <i className="fi fi-rr-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">No drugs added yet</p>
            )}
            {form.touched.drugs && form.errors.drugs ? (
                <div className="text-red-500 text-sm">{form.errors.drugs.toString()}</div>
            ) : null}
        </div>
    )
}

export default DrugsComponent