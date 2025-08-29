"use client";

import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchableDropdown from "@/components/utils/SearchAbleDropdown";
import Link from "next/link";

interface ICustomers {
  contact_name: string;
  contact_id: string;
}

export default function UploadCsvPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [hmoName, setHmoName] = useState<string | null>(null);

  const getCustomers = async () => {
    const response = await axios.get<any[]>("/api/zoho/contacts");
    return response.data ?? [];
  };

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv") {
        setCsvFile(file);
      } else {
        toast.error("Please upload a CSV file.");
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile || !customerId || !hmoName) {
      alert("Please select a customer and upload a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("customerId", customerId);
    formData.append("hmoName", hmoName);

    setIsUploading(true);
    try {
      await axios.post("/api/db/customer/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("CSV uploaded successfully!");
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      toast.error("Upload failed.");
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload CSV for Customer</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium mb-1">
            Customer
          </label>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading customers...</p>
          ) : (
            <SearchableDropdown
              value={customerId ?? ""}
              data={
                customers
                  ? customers.map((c: ICustomers) => ({
                      name: c.contact_name.toUpperCase(),
                      value: c.contact_id,
                    }))
                  : []
              }
              onSelect={(value) => {
                setCustomerId(value.value);
                setHmoName(value.name);
              }}
              placeholder="Select Customer"
            />
          )}
        </div>

        <div>
          <label htmlFor="csvFile" className="block text-sm font-medium mb-1">
            Upload CSV
          </label>
          <span className="border p-2 rounded-md">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="mb-4"
            />
          </span>
        </div>

        <button
          disabled={!csvFile || isLoading || isUploading}
          type="submit"
          className={
            `px-4 py-2 bg-blue-600 text-white rounded-md` +
            (isUploading || !csvFile ? " opacity-50 cursor-not-allowed" : "")
          }
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <Link
        href="/sample-procedures.csv"
        download
        className="relative top-4 text-blue-600 underline hover:text-blue-800"
      >
        Download CSV Template
      </Link>
    </div>
  );
}
