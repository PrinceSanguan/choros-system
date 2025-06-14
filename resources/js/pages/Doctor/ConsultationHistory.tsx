import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Sidebar } from '@/components/doctor/sidebar';
import { Header } from '@/components/doctor/header';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import axios from 'axios';

// Import icons from react-icons instead
import { FiEye, FiSearch, FiUser, FiArrowLeft, FiLoader } from 'react-icons/fi';

interface DoctorUser {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface Patient {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface VitalSigns {
    blood_pressure?: string;
    heart_rate?: string;
    respiratory_rate?: string;
    temperature?: string;
    height?: string;
    weight?: string;
    bmi?: string;
}

interface PastRecord {
    id: number;
    record_type: string;
    appointment_date: string;
    details?: string;
    vital_signs?: VitalSigns;
    findings?: string;
    diagnosis?: string;
}

interface Consultation {
    id: number;
    patient_id: number;
    assigned_doctor_id: number;
    status: string;
    appointment_date: string;
    appointment_time?: string;
    reason?: string;
    notes?: string;
    completed_at?: string;
    patient: Patient;
    vital_signs?: VitalSigns;
    past_records?: PastRecord[];
    details?: Record<string, unknown>; // Better typing for details
    sequentialNumber?: number; // Add this to the base interface
}

interface PatientWithDate {
    id: number;
    name: string;
    email: string;
    registered_on: string; // Using the earliest consultation date as registered date
}

interface Props {
    user: DoctorUser;
    consultations: Consultation[];
}

export default function ConsultationHistory({ user, consultations }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

    // Process consultations to extract unique patients with their earliest consultation date
    const getPatientsList = (): PatientWithDate[] => {
        const patientMap = new Map<number, { patient: Patient; earliestDate: string }>();

        consultations.forEach(consultation => {
            const existingPatient = patientMap.get(consultation.patient_id);

            if (!existingPatient || new Date(consultation.appointment_date) < new Date(existingPatient.earliestDate)) {
                patientMap.set(consultation.patient_id, {
                    patient: consultation.patient,
                    earliestDate: consultation.appointment_date
                });
            }
        });

        return Array.from(patientMap.values()).map(item => ({
            id: item.patient.id,
            name: item.patient.name,
            email: item.patient.email,
            registered_on: item.earliestDate
        }));
    };

    const patientsList = getPatientsList();

    // Filter patients based on search term
    const filteredPatients = patientsList.filter(
        patient =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get consultations for a specific patient
    const getPatientConsultations = (patientId: number): (Consultation & { sequentialNumber: number })[] => {
        return consultations.filter(consultation => consultation.patient_id === patientId)
            .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
            .map((consultation, index) => ({
                ...consultation,
                sequentialNumber: index + 1 // Add sequential numbering starting from 1
            }));
    };

    const openConsultationDetails = async (consultation: Consultation & { sequentialNumber: number }) => {
        setSelectedConsultation(consultation);
        setIsModalOpen(true);

        // Fetch patient's past medical records
        setIsLoading(true);
        try {
            const response = await axios.get(`/doctor/patient/${consultation.patient_id}/records`);
            if (response.data && response.data.records) {
                setSelectedConsultation({
                    ...consultation,
                    past_records: response.data.records
                });
            }
        } catch (error) {
            console.error('Error fetching patient records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    // Extract vital signs from consultation details if available
    const getVitalSigns = (consultation: Consultation) => {
        if (!consultation) return null;

        try {
            if (consultation.vital_signs) {
                return consultation.vital_signs;
            }

            if (consultation.details) {
                const details = typeof consultation.details === 'string'
                    ? JSON.parse(consultation.details)
                    : consultation.details;

                if (details && details.vital_signs) {
                    return details.vital_signs;
                }
            }
        } catch (e) {
            console.error('Error parsing vital signs:', e);
        }

        return null;
    };

    const viewPatientConsultations = (patientId: number) => {
        setSelectedPatientId(patientId);
    };

    const goBackToPatientsList = () => {
        setSelectedPatientId(null);
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head title="Consultation History" />
            <Sidebar user={user} />

            <div className="flex flex-col flex-1">
                <Header user={user} />

                <main className="flex-1 p-6">
                    <h1 className="text-2xl font-semibold mb-6">Consultation History</h1>

                    {selectedPatientId === null ? (
                        // Show Patients List
                        <Card className="w-full">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Patients</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <Input
                                            type="search"
                                            placeholder="Search patient..."
                                            className="pl-8 w-64"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Registered On</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((patient) => (
                                                <TableRow key={patient.id}>
                                                    <TableCell className="flex items-center gap-2">
                                                        <FiUser className="h-5 w-5 text-gray-400" />
                                                        {patient.name}
                                                    </TableCell>
                                                    <TableCell>{patient.email}</TableCell>
                                                    <TableCell>{formatDate(patient.registered_on)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => viewPatientConsultations(patient.id)}
                                                        >
                                                            View Consultations
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-4">
                                                    No patients found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        // Show Patient's Consultations
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                className="mb-4 flex items-center gap-2"
                                onClick={goBackToPatientsList}
                            >
                                <FiArrowLeft className="h-4 w-4" />
                                Back to Patients List
                            </Button>

                            <Card className="w-full">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>
                                        Consultations for {patientsList.find(p => p.id === selectedPatientId)?.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Booking #</TableHead>
                                                <TableHead>Patient</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Completed On</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {getPatientConsultations(selectedPatientId).length > 0 ? (
                                                getPatientConsultations(selectedPatientId).map((consultation) => (
                                                    <TableRow key={consultation.id}>
                                                        <TableCell>Booking #{consultation.sequentialNumber}</TableCell>
                                                        <TableCell>{consultation.patient.name}</TableCell>
                                                        <TableCell>{formatDate(consultation.appointment_date)}</TableCell>
                                                        <TableCell>{consultation.appointment_time || 'N/A'}</TableCell>
                                                        <TableCell className="max-w-[200px] truncate">
                                                            {consultation.reason || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {consultation.completed_at ? formatDate(consultation.completed_at) : 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openConsultationDetails(consultation)}
                                                            >
                                                                <FiEye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-4">
                                                        No consultation history found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </main>

                {/* Consultation Details Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[650px]">
                        <DialogHeader>
                            <DialogTitle>Consultation Details</DialogTitle>
                        </DialogHeader>
                        {isLoading ? (
                            <div className="flex justify-center items-center p-8">
                                <FiLoader className="h-8 w-8 animate-spin text-primary" />
                                <span className="ml-2">Loading medical records...</span>
                            </div>
                        ) : selectedConsultation && (
                            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-500">Patient</h4>
                                        <p className="text-base">{selectedConsultation.patient.name}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-500">Booking #</h4>
                                        <p className="text-base">#{selectedConsultation.sequentialNumber || selectedConsultation.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-500">Date</h4>
                                        <p className="text-base">{formatDate(selectedConsultation.appointment_date)}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-500">Time</h4>
                                        <p className="text-base">{selectedConsultation.appointment_time || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-sm text-gray-500">Reason for Visit</h4>
                                    <p className="text-base">{selectedConsultation.reason || 'Not specified'}</p>
                                </div>

                                {/* Vital Signs Section */}
                                {getVitalSigns(selectedConsultation) && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-base mb-2 text-primary">Vital Signs</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {getVitalSigns(selectedConsultation)?.blood_pressure && (
                                                <div>
                                                    <h5 className="font-medium text-sm text-gray-500">Blood Pressure</h5>
                                                    <p>{getVitalSigns(selectedConsultation)?.blood_pressure}</p>
                                                </div>
                                            )}
                                            {getVitalSigns(selectedConsultation)?.heart_rate && (
                                                <div>
                                                    <h5 className="font-medium text-sm text-gray-500">Heart Rate</h5>
                                                    <p>{getVitalSigns(selectedConsultation)?.heart_rate} bpm</p>
                                                </div>
                                            )}
                                            {getVitalSigns(selectedConsultation)?.respiratory_rate && (
                                                <div>
                                                    <h5 className="font-medium text-sm text-gray-500">Respiratory Rate</h5>
                                                    <p>{getVitalSigns(selectedConsultation)?.respiratory_rate} breaths/min</p>
                                                </div>
                                            )}
                                            {getVitalSigns(selectedConsultation)?.temperature && (
                                                <div>
                                                    <h5 className="font-medium text-sm text-gray-500">Temperature</h5>
                                                    <p>{getVitalSigns(selectedConsultation)?.temperature}°C</p>
                                                </div>
                                            )}
                                            {getVitalSigns(selectedConsultation)?.height && (
                                                <div>
                                                    <h5 className="font-medium text-sm text-gray-500">Height</h5>
                                                    <p>{getVitalSigns(selectedConsultation)?.height} cm</p>
                                                </div>
                                            )}
                                            {getVitalSigns(selectedConsultation)?.weight && (
                                                <div>
                                                    <h5 className="font-medium text-sm text-gray-500">Weight</h5>
                                                    <p>{getVitalSigns(selectedConsultation)?.weight} kg</p>
                                                </div>
                                            )}
                                            {getVitalSigns(selectedConsultation)?.bmi && (
                                                <div>
                                                    <h5 className="font-medium text-sm text-gray-500">BMI</h5>
                                                    <p>{getVitalSigns(selectedConsultation)?.bmi}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Past Findings Section */}
                                {selectedConsultation.past_records && selectedConsultation.past_records.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-medium text-base mb-2 text-primary">Past Medical Records</h4>
                                        <div className="space-y-3">
                                            {selectedConsultation.past_records.slice(0, 3).map((record) => (
                                                <div key={record.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h5 className="font-medium">{record.record_type === 'medical_record' ? 'Medical Record' :
                                                                               record.record_type === 'laboratory' ? 'Laboratory Test' :
                                                                               'Medical Checkup'}</h5>
                                                        <span className="text-sm text-gray-500">{formatDate(record.appointment_date)}</span>
                                                    </div>
                                                    {record.diagnosis && (
                                                        <div className="mb-1">
                                                            <span className="text-sm font-medium text-gray-500">Diagnosis: </span>
                                                            <span>{record.diagnosis}</span>
                                                        </div>
                                                    )}
                                                    {record.findings && (
                                                        <div className="text-sm">
                                                            <span className="font-medium text-gray-500">Findings: </span>
                                                            <span>{record.findings}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {selectedConsultation.past_records.length > 3 && (
                                                <div className="text-center">
                                                    <Button variant="link" onClick={() => window.open(`/doctor/patient/${selectedConsultation.patient_id}/medical-records`, '_blank')}>
                                                        View All Medical Records
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-sm text-gray-500">Notes</h4>
                                    <p className="text-base">{selectedConsultation.notes || 'No notes available'}</p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-sm text-gray-500">Completed On</h4>
                                    <p className="text-base">
                                        {selectedConsultation.completed_at
                                            ? formatDate(selectedConsultation.completed_at)
                                            : 'Not recorded'}
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
