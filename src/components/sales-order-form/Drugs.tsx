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
import { isValidObjectId } from '@/utils/helper/is-valid-objectid-helper';
export interface IDrugComponent {
    form: FormikProps<SalesOrderFormInput>
}
const DrugsComponent: React.FC<IDrugComponent> = ({ form }) => {

    const [newDrug, setNewDrug] = useState<Drugs>({
        name: '',
        id: '',
        quantity: 0,
        price: 0,
        unit: 0,

    });

    const [inventoryDrug, setInventoryDrug] = useState({ name: "", item_id: "", locationQty: 0, unit: 0 })
    const [checkingAvailability, setCheckAvailabilty] = useState<boolean | undefined>(undefined)

    const getCustomers = async () => {
        const response = await axios.get<{ customers: ICustomers[] }>('/api/db/customer')
        return (response).data ?? []
    }
    const { data: customers } = useQuery({ queryKey: ["db-customers"], queryFn: getCustomers })


    const getInventoryItems = async () => {

        const response = await axios.get<{ items: Item[] }>('/api/zoho/inventory-item')
        return response.data.items ?? []
    }
    const { data: inventoryItems, error, isLoading, refetch: inventoryRefetch } = useQuery({ queryKey: ["inventory-items"], queryFn: getInventoryItems, })

    const { data: drugs, isLoading: drugLoading, refetch } = useQuery({
        queryKey: ["fetch-customer-drugs"], queryFn: async () => {
            const selectedCustomer = customers?.customers.find(customer => customer.zohoInventoryCustomerId == form.values.customer)
            if (selectedCustomer?._id && isValidObjectId(selectedCustomer?._id)) {
                const res = await axios.get<IProcedure[]>(`/api/db/drugs?customer=${selectedCustomer?._id}`)
                // console.log({ data: res.data })
                return res?.data ?? []
            }
            return []
        },
        enabled: false
    })


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
            setInventoryDrug({ name: "", item_id: "", locationQty: 0, unit: 0 })
        } else {
            toast.warn("Please fill in the drug details")
        }
    };

    const handleInventoryItemSelect = async (value: { name: string; id: string }) => {
        setCheckAvailabilty(true)
        const res = await axios.get<{ item: Item }>(`/api/zoho/inventory-item/${value.id}`)

        if (!res?.data) {
            setCheckAvailabilty(false)
            toast.error("Something went wrong this item was not found")
            return
        }
        const item = res.data.item
        setCheckAvailabilty(false)
        // console.log({ item })
        const pickedLocation = item.locations.find((loc) => loc.location_id == form.values.location)


        if (!pickedLocation || !pickedLocation.location_stock_on_hand) {
            toast.warn(`Location doesn't have this item`)
            // console.log("Item is unavailable")
            setNewDrug({
                name: '',
                id: '',
                quantity: 0,
                price: 0,
                unit: 0,
            })
            return
        }
        // console.log({ pickedLocation })
        const unitPrice = pickedLocation.initial_stock_rate
        setInventoryDrug(prev => ({ ...prev, name: item.name, item_id: item.item_id.toString(), unit: pickedLocation.initial_stock_rate, locationQty: parseFloat(pickedLocation.location_stock_on_hand) }))
        setNewDrug({ ...newDrug, id: value.id, name: value.name, unit: pickedLocation.initial_stock_rate, price: parseFloat((unitPrice * (newDrug.quantity || 1)).toFixed(2)), quantity: newDrug.quantity ? newDrug.quantity : 1 })
    }

    const removeDrug = (index: number) => {
        const newDrugs = [...form.values.drugs];
        newDrugs.splice(index, 1);
        form.setFieldValue('drugs', newDrugs);
    };

    useEffect(() => {
        setNewDrug({
            name: '',
            id: '',
            quantity: 0,
            price: 0,
            unit: 0,
        })
    }, [form.values.location])

    useEffect(() => {
        if (form.values.customer) {
            refetch()
        }
    }, [form.values.customer])

    return (
        <div className="border-t pt-4 ">
            <h3 className="text-lg font-medium mb-2">Drugs</h3>

            <div className="space-y-2 mb-4 p-3 bg-[#d3d7c9] rounded text-zinc-800">
                <h4 className="font-medium">Add New Drug</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className='col-span-2'>
                        <label htmlFor="inventoryItemName" className="block text-sm font-medium ">
                            Select Item from Inventory
                        </label>
                        <SearchableDropdown value={newDrug.id} isLoading={isLoading} data={inventoryItems ? inventoryItems.map(item => ({ name: item.name, value: item.item_id })) : []} onSelect={(value) => { handleInventoryItemSelect({ name: value.name, id: value.value }) }} placeholder='Select item from inventory' />
                        <span className='h-2 w-full'>{checkingAvailability == true &&
                            <p className='text-gray-500 italic text-xs'>Checking item in inventory <span className='text-sm font-semibold loading-ellipses'>...</span></p>

                        }{checkingAvailability == false && newDrug.id && <p className='text-gray-800 italic text-sm'>Available stock: {inventoryDrug.locationQty}</p>}</span>
                    </div>
                    <div className='col-span-2'>
                        <label htmlFor="customerItemName" className="block text-sm font-medium ">
                            Customer Item
                        </label>
                        <SearchableDropdown value={inventoryDrug.item_id} isLoading={isLoading} data={drugs ? drugs.map(item => ({ name: item.name, value: item._id })) : []} onSelect={(value) => {
                            const selectedProcedure = drugs?.find(item => item._id == value.value)
                            setInventoryDrug({ ...inventoryDrug, item_id: value.value, name: value.name })
                            setNewDrug({ ...newDrug, ...(!newDrug.quantity && { quantity: 1 }), unit: ((selectedProcedure?.rate) ?? newDrug.unit), price: ((selectedProcedure?.rate) ?? newDrug.unit) * (newDrug.quantity) })
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
                            onChange={(e) => setNewDrug({ ...newDrug, quantity: parseInt(e.target.value || "0"), price: parseFloat((newDrug.unit * (newDrug.quantity || 1)).toFixed(2)) })}
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
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 rounded font-medium text-sm">
                        <div className="col-span-4">Name</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-center">Unit Price</div>
                        <div className="col-span-2 text-center">Price</div>
                        <div className="col-span-2 text-center">Action</div>
                    </div>

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