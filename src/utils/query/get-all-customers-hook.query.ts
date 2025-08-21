import { ICustomers } from "@/types/customers.type";
import { Contact } from "@/types/get-zoho-inventory-customer.type";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const useGetAllContacts = () => {
  // const [data, setData] = useState<ICustomers[]>([])
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

    console.log(customersTracker);

    return availableContacts;
  };
  const {
    data: customers,
    isLoading,
    error,
  } = useQuery({ queryKey: ["customers"], queryFn: getCustomers });

  //   console.log({ customers });

  return { customers, error, isLoading };
};

export default useGetAllContacts;
