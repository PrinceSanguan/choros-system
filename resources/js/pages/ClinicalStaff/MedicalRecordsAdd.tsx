import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Header } from '@/components/clinicalstaff/header';
import { Sidebar } from '@/components/clinicalstaff/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  name: string;
  email: string;
  role?: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
}

interface Patient {
  id: number;
  name: string;
  email: string;
}

interface MedicalRecordsAddProps {
  user: User;
  patients: Patient[];
  doctors: Doctor[];
}

export default function MedicalRecordsAdd({ user, patients, doctors }: MedicalRecordsAddProps) {
  const { data, setData, post, processing, errors } = useForm({
    patient_id: '',
    assigned_doctor_id: '',
    record_type: 'medical_record',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '09:00',
    diagnosis: '',
    notes: '',
    status: 'pending',
    vital_signs: {
      temperature: '',
      blood_pressure: '',
      pulse_rate: '',
      respiratory_rate: '',
      oxygen_saturation: ''
    },
    prescriptions: [''],
    followup_date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('staff.clinical.info.store'));
  };

  const addPrescription = () => {
    setData('prescriptions', [...data.prescriptions, '']);
  };

  const removePrescription = (index: number) => {
    const updatedPrescriptions = [...data.prescriptions];
    updatedPrescriptions.splice(index, 1);
    setData('prescriptions', updatedPrescriptions);
  };

  const updatePrescription = (index: number, value: string) => {
    const updatedPrescriptions = [...data.prescriptions];
    updatedPrescriptions[index] = value;
    setData('prescriptions', updatedPrescriptions);
  };

  const recordTypeOptions = [
    { value: 'medical_record', label: 'General Medical Record' },
    { value: 'medical_checkup', label: 'Medical Checkup' },
    { value: 'prescription', label: 'Prescription' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">
          <Head title="Add Medical Record" />

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild className="p-0">
                    <Link href={route('staff.clinical.info')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Add Medical Record
                  </h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Create a new medical record for a patient
                </p>
              </div>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Medical Record Details</CardTitle>
                  <CardDescription>
                    Enter the details for the patient's medical record
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Patient Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="patient_id">Patient <span className="text-red-500">*</span></Label>
                    <Select
                      onValueChange={(value) => setData('patient_id', value)}
                      value={data.patient_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name} ({patient.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.patient_id && (
                      <p className="text-sm text-red-500">{errors.patient_id}</p>
                    )}
                  </div>

                  {/* Doctor Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_doctor_id">Doctor <span className="text-red-500">*</span></Label>
                    <Select
                      onValueChange={(value) => setData('assigned_doctor_id', value)}
                      value={data.assigned_doctor_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            Dr. {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assigned_doctor_id && (
                      <p className="text-sm text-red-500">{errors.assigned_doctor_id}</p>
                    )}
                  </div>

                  {/* Record Type */}
                  <div className="space-y-2">
                    <Label htmlFor="record_type">Record Type <span className="text-red-500">*</span></Label>
                    <Select
                      onValueChange={(value) => setData('record_type', value)}
                      value={data.record_type}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        {recordTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.record_type && (
                      <p className="text-sm text-red-500">{errors.record_type}</p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointment_date">Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="appointment_date"
                        type="date"
                        value={data.appointment_date}
                        onChange={(e) => setData('appointment_date', e.target.value)}
                      />
                      {errors.appointment_date && (
                        <p className="text-sm text-red-500">{errors.appointment_date}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointment_time">Time</Label>
                      <Input
                        id="appointment_time"
                        type="time"
                        value={data.appointment_time}
                        onChange={(e) => setData('appointment_time', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                    <Select
                      onValueChange={(value) => setData('status', value)}
                      value={data.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-500">{errors.status}</p>
                    )}
                  </div>

                  {/* Diagnosis */}
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Enter diagnosis details"
                      value={data.diagnosis}
                      onChange={(e) => setData('diagnosis', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Vital Signs */}
                  <div className="space-y-4">
                    <Label>Vital Signs</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature (°C)</Label>
                        <Input
                          id="temperature"
                          type="text"
                          placeholder="37.0"
                          value={data.vital_signs.temperature}
                          onChange={(e) => setData('vital_signs', {
                            ...data.vital_signs,
                            temperature: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="blood_pressure">Blood Pressure (mmHg)</Label>
                        <Input
                          id="blood_pressure"
                          type="text"
                          placeholder="120/80"
                          value={data.vital_signs.blood_pressure}
                          onChange={(e) => setData('vital_signs', {
                            ...data.vital_signs,
                            blood_pressure: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pulse_rate">Pulse Rate (bpm)</Label>
                        <Input
                          id="pulse_rate"
                          type="text"
                          placeholder="72"
                          value={data.vital_signs.pulse_rate}
                          onChange={(e) => setData('vital_signs', {
                            ...data.vital_signs,
                            pulse_rate: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="respiratory_rate">Respiratory Rate (bpm)</Label>
                        <Input
                          id="respiratory_rate"
                          type="text"
                          placeholder="16"
                          value={data.vital_signs.respiratory_rate}
                          onChange={(e) => setData('vital_signs', {
                            ...data.vital_signs,
                            respiratory_rate: e.target.value
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="oxygen_saturation">Oxygen Saturation (%)</Label>
                        <Input
                          id="oxygen_saturation"
                          type="text"
                          placeholder="98"
                          value={data.vital_signs.oxygen_saturation}
                          onChange={(e) => setData('vital_signs', {
                            ...data.vital_signs,
                            oxygen_saturation: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prescriptions */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Prescriptions</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPrescription}
                      >
                        Add Prescription
                      </Button>
                    </div>

                    {data.prescriptions.map((prescription, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Enter prescription details"
                          value={prescription}
                          onChange={(e) => updatePrescription(index, e.target.value)}
                          className="flex-1"
                        />
                        {data.prescriptions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrescription(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Enter any additional notes"
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Follow-up Date */}
                  <div className="space-y-2">
                    <Label htmlFor="followup_date">Follow-up Date</Label>
                    <Input
                      id="followup_date"
                      type="date"
                      value={data.followup_date}
                      onChange={(e) => setData('followup_date', e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={route('staff.clinical.info')}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={processing}>
                    Create Medical Record
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
