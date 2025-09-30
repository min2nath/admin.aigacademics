'use client'

import React, { useState, useEffect} from 'react'
import { TeamFormSchema, TeamFormValues } from '@/validations/teamSchema'
import { FaUser, FaEnvelope, FaPhone, FaAmazon, FaAtlassian } from "react-icons/fa";
import InputWithIcon from "@/components/InputWithIcon";
import {
  zodResolver,
  useForm,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/lib/imports'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SheetClose,
  toast,
  status,
} from '@/lib/imports'
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { getIndianFormattedDate } from '@/lib/formatIndianDate';

type AddTeamFormProps = {
  defaultValues?: TeamFormValues & { _id?: string }
  onSave: (formData: TeamFormValues & { _id?: string }) => Promise<void>
  onSuccess?: () => void
}

export default function AddTeamForm({ defaultValues, onSave}: AddTeamFormProps) {
  const [loading, setLoading] = useState(false)
  const [organizers, setOrganizers] = useState<any[]>([])

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(TeamFormSchema),
    defaultValues: defaultValues || {
      companyName: '',
      name: '',
      email: '',
      mobile: '',
      status: 'Active',
    },
  })

 // Fetch dropdown data
   useEffect(() => {
     const fetchDropdownData = async () => {
       try {
         const [organizerRes] = await Promise.all([
           
           fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizers`),
           
         ])
         const [organizerJson] = await Promise.all([
           organizerRes.json(),
         ])
         setOrganizers(organizerJson.data || [])
       } catch (error) {
         console.error("❌ Failed to fetch dropdown data", error)
       }
     }
     fetchDropdownData()
   }, [])

  async function onSubmit(data: TeamFormValues & { _id?: string }) {
      try {
        setLoading(true)
        
            let res
            if (defaultValues?._id) {
              // Edit mode
              res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams/${defaultValues._id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                }
              )
            } else {
              // Add mode
              res = await fetchWithAuth(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ ...data, status: "Active" }),
                }
              )
            }
        
            const result = await res.json()
            if (!res.ok) throw new Error(result.message || "Failed to save team")
        
            if (defaultValues?._id) {
              toast("Team has been updated successfully!", {
                  description: getIndianFormattedDate(),
                })
            } else {
              toast("Team has been created successfully!", {
                  description: getIndianFormattedDate(),
                })
            }
        
            onSave?.(result.data)
            form.reset()
          } catch (err: any) {
            toast.error(err.message || "Something went wrong ❌")
          } finally {
            setLoading(false)
          }
        }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form
            id="add-team-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pl-3 pr-3"
          >
            {/* Company Name */}
           {/* Organizer Dropdown */}
                   <FormField
                     control={form.control}
                     name="companyName"
                     render={({ field }) => (
                       <FormItem className="w-full">
                         <FormLabel>Company Name *</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value}>
                           <SelectTrigger className="w-full p-3">
                             <SelectValue placeholder="Select company" />
                           </SelectTrigger>
                           <SelectContent>
                             {organizers.map((org) => (
                               <SelectItem key={org.organizerName} value={org.organizerName}>
                                 {org.organizerName}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )}
                   />

  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Contact Person Name *</FormLabel>
        <FormControl>
          <InputWithIcon {...field} placeholder="Type contact person name" icon={<FaUser />} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Contact Person Email *</FormLabel>
        <FormControl>
          <InputWithIcon {...field} placeholder="Type contact person email address" icon={<FaEnvelope />} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="mobile"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Contact Person Mobile Number *</FormLabel>
        <FormControl>
          <InputWithIcon
            {...field}
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="Type contact person mobile number"
            icon={<FaPhone />}
            onInput={(e) => {
              const input = e.currentTarget;
              input.value = input.value.replace(/\D/g, "").slice(0, 10);
            }}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full p-3">
                        <SelectValue placeholder="Select status type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {status.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between">
        <SheetClose asChild>
          <Button
            type="button"
            variant="outline"
            className="border border-gray-400"
            disabled={loading}
          >
            Close
          </Button>
        </SheetClose>

        <Button
          type="submit"
          form="add-team-form"
          disabled={loading}
          className="bg-sky-800 text-white hover:bg-sky-900"
        >
          {loading ? (defaultValues ? 'Updating...' : 'Creating...') : defaultValues ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  )
}
