import { Drugs } from '@/types/drugs.type';
import { SalesOrderFormInput } from '@/types/sales-order-form-input.type';
import { Formik, FormikBag, FormikHelpers, FormikProps } from 'formik';
import React, { useState } from 'react'

export interface IDrugComponent {
    form: FormikProps<SalesOrderFormInput>
}
const DrugsComponent: React.FC<IDrugComponent> = ({ form }) => {

    const [newDrug, setNewDrug] = useState<Drugs>({
        name: '',
        id: '',
        quantity: 0,
        price: 0
    });

    const addDrug = () => {
        if (newDrug.name && newDrug.id && newDrug.quantity > 0 && newDrug.price > 0) {
            form.setFieldValue('drugs', [...form.values.drugs, newDrug]);
            setNewDrug({
                name: '',
                id: '',
                quantity: 0,
                price: 0
            });
        }
    };

    const removeDrug = (index: number) => {
        const newDrugs = [...form.values.drugs];
        newDrugs.splice(index, 1);
        form.setFieldValue('drugs', newDrugs);
    };
    return (
        <div className="border-t pt-4 ">
            <h3 className="text-lg font-medium mb-2">Drugs</h3>

            {/* Add new drug */}
            <div className="space-y-2 mb-4 p-3 bg-[#d3d7c9] rounded text-zinc-800">
                <h4 className="font-medium">Add New Drug</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className='col-span-2'>
                        <label htmlFor="drugName" className="block text-sm font-medium ">
                            Name
                        </label>
                        <input
                            type="text"
                            id="drugName"
                            value={newDrug.name}
                            onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                        />
                    </div>
                    {/* <div>
                        <label htmlFor="drugId" className="block text-sm font-medium ">
                            ID
                        </label>
                        <input
                            type="text"
                            id="drugId"
                            value={newDrug.id}
                            onChange={(e) => setNewDrug({ ...newDrug, id: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                        />
                    </div> */}
                    <div>
                        <label htmlFor="drugQuantity" className="block text-sm font-medium ">
                            Quantity
                        </label>
                        <input
                            type="number"
                            id="drugQuantity"
                            value={newDrug.quantity}
                            onChange={(e) => setNewDrug({ ...newDrug, quantity: parseInt(e.target.value || "0") })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="drugPrice" className="block text-sm font-medium ">
                            Price
                        </label>
                        <input
                            type="number"
                            id="drugPrice"
                            value={newDrug.price}
                            onChange={(e) => setNewDrug({ ...newDrug, price: parseFloat(e.target.value || "0") })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border text-sm"
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
                <div className="space-y-2 border-y-2 rounded-md p-2 shadow-2xl">
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
                            key={index}
                            className="grid grid-cols-12 gap-2 items-center p-3 border rounded hover:bg-gray-50 hover:text-zinc-800 transition-colors"
                        >
                            <div className="col-span-4 font-medium truncate" title={drug.name}>
                                {drug.name}
                            </div>
                            <div className="col-span-2 text-center text-sm">
                                {drug.quantity}
                            </div>
                            <div className="col-span-2 text-center text-sm text-gray-600 truncate" title={drug.price.toString()}>
                                ₦{drug.price.toFixed(2)}
                            </div>
                            <div className="col-span-2 text-center text-sm font-mono">
                                ₦{(drug.price * drug.quantity).toFixed(2)}
                            </div>
                            <div className="col-span-2 text-center">
                                <button
                                    type="button"
                                    onClick={() => removeDrug(index)}
                                    className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded hover:bg-red-50 hover:-ml-6 transition-all"
                                >
                                    Remove
                                </button>
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