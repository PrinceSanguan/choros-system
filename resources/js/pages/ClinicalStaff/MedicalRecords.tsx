import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Header } from '@/components/clinicalstaff/header';
import { Sidebar } from '@/components/clinicalstaff/sidebar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { PlusIcon, EyeIcon, TrashIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface Doctor {
  id: number;
  name: string;
}

interface Patient {
  id: number;
  name: string;
}

interface RecordDetails {
  appointment_time?: string;
  vital_signs?: Record<string, string | number>;
  diagnosis?: string;
  prescriptions?: string[];
  notes?: string;
  followup_date?: string;
  lab_type?: string;
  results?: string;
  [key: string]: string | number | string[] | Record<string, string | number> | undefined;
}

interface Prescription {
  id: number;
  patient_id: number;
  record_id: number;
  doctor_id: number;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescription_date: string;
  reference_number: string;
  status: string;
}

interface MedicalRecord {
  id: number;
  patient: Patient;
  assignedDoctor: Doctor;
  record_type: string;
  appointment_date: string;
  status: string;
  details: string | RecordDetails;
  created_at: string;
  updated_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface MedicalRecordsProps {
  user: User;
  medicalRecords: {
    data: MedicalRecord[];
    links: PaginationLink[];
    total: number;
  };
}

export default function MedicalRecords({ user, medicalRecords }: MedicalRecordsProps) {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [prescriptions, setPrescriptions] = useState<{ [key: number]: Prescription[] }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});

  // Initialize Inertia form
  const { delete: deleteRecord, processing } = useForm();

  // Filter out cancelled records
  const filteredRecords = medicalRecords.data.filter(record =>
    record.status.toLowerCase() !== 'cancelled'
  );

  const confirmDelete = (id: number) => {
    setRecordToDelete(id);
    setDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setRecordToDelete(null);
    setDeleteDialog(false);
  };

  const handleDelete = () => {
    if (recordToDelete) {
      // Use Inertia's form handler with delete method
      deleteRecord(route('staff.clinical.info.destroy', recordToDelete), {
        preserveScroll: true,
        onSuccess: () => {
          closeDeleteDialog();
        },
        onError: () => {
          alert('Failed to delete the medical record. Please try again.');
          closeDeleteDialog();
        }
      });
    } else {
      closeDeleteDialog();
    }
  };

  const handleDownloadPrescription = async (recordId: number) => {
    try {
      setLoading({ ...loading, [recordId]: true });

      // Check if we already have the prescriptions for this record
      if (!prescriptions[recordId]) {
        // Fetch prescriptions for this record
        const response = await axios.get(route('staff.prescriptions.record', recordId));
        setPrescriptions({ ...prescriptions, [recordId]: response.data });
      }

      const recordPrescriptions = prescriptions[recordId] || [];

      if (recordPrescriptions.length > 0) {
        // If we have prescriptions, download the first one
        window.open(route('staff.prescriptions.download', recordPrescriptions[0].id), '_blank');
      } else {
        alert('No prescriptions found for this record');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      alert('Failed to download prescription');
    } finally {
      setLoading({ ...loading, [recordId]: false });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-500 border-orange-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRecordTypeDisplay = (recordType: string): string => {
    switch (recordType.toLowerCase()) {
      case 'medical_checkup':
        return 'Medical Checkup';
      case 'medical_record':
        return 'General Record';
      case 'prescription':
        return 'Prescription';
      case 'laboratory':
        return 'Lab Test';
      default:
        return recordType.replace('_', ' ');
    }
  };

  const getDetailsValue = (record: MedicalRecord, key: string): string => {
    let details: RecordDetails;

    if (typeof record.details === 'string') {
      try {
        details = JSON.parse(record.details) as RecordDetails;
      } catch {
        return 'N/A';
      }
    } else {
      details = record.details;
    }

    // Return either diagnosis or lab_type based on record type
    if (key === 'info') {
      if (record.record_type === 'laboratory') {
        return details?.lab_type || 'N/A';
      } else {
        return details?.diagnosis || 'N/A';
      }
    }

    return 'N/A';
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Head title="Medical Records" />
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar user={user} />
        <div className="flex-1">
          <Header user={user} />
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-2xl font-bold">Medical Records</CardTitle>
                  <CardDescription>
                    View and manage all medical records
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Link href={route('staff.clinical.info.create')}>
                    <Button className="flex items-center gap-1">
                      <PlusIcon className="h-4 w-4" />
                      <span>Add New Record</span>
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <caption className="mt-4 text-sm text-muted-foreground">
                    A list of medical records
                  </caption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Record Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.appointment_date)}</TableCell>
                          <TableCell className="font-medium">{record.patient?.name || 'Unknown Patient'}</TableCell>
                          <TableCell>{getRecordTypeDisplay(record.record_type)}</TableCell>
                          <TableCell className="max-w-xs truncate">{getDetailsValue(record, 'info')}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                              >
                                <Link href={route('staff.clinical.info.show', record.id)}>
                                  <EyeIcon className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadPrescription(record.id)}
                                disabled={loading[record.id]}
                                className="opacity-70 hover:opacity-100"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No medical records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Links */}
                {medicalRecords.links && medicalRecords.links.length > 3 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex space-x-1" aria-label="Pagination">
                      {medicalRecords.links.map((link, index) => {
                        // Skip the "prev" and "next" links
                        if (index === 0 || index === medicalRecords.links.length - 1) return null;

                        return (
                          <a
                            key={index}
                            href={link.url || '#'}
                            aria-current={link.active ? 'page' : undefined}
                            className={`relative inline-flex items-center px-4 py-2 text-sm ${
                              link.active
                                ? 'bg-blue-500 text-white font-semibold'
                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                            } rounded-md`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      })}
                    </nav>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <p className="py-4">Are you sure you want to delete this medical record? This action cannot be undone.</p>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDeleteDialog} disabled={processing}>
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {processing ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </>
  );
}
