import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';

interface User {
    name: string;
    email: string;
    role?: string;
}

interface AppointmentTrend {
    name: string;
    pending: number;
    completed: number;
    cancelled: number;
}

interface PatientGrowth {
    name: string;
    new_patients: number;
}

interface AppointmentType {
    name: string;
    value: number;
    color: string;
}

interface ReportsProps {
    user: User;
    stats: {
        users: {
            total: number;
            patients: number;
            doctors: number;
            staff: number;
            new_this_month: number;
        };
        appointments: {
            total: number;
            pending: number;
            completed: number;
            cancelled: number;
            this_month: number;
        };
    };
    charts: {
        appointmentTrends: AppointmentTrend[];
        patientGrowth: PatientGrowth[];
        appointmentTypes: AppointmentType[];
    };
}

export default function Reports({ user, stats, charts }: ReportsProps) {
    const [activeTab, setActiveTab] = useState('appointment');
    const [reportType, setReportType] = useState('summary');

    const handleDownloadReport = () => {
        window.location.href = route('admin.reports.download', { type: reportType });
    };

    return (
        <AdminLayout user={user}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground">View and download reports based on clinic data.</p>
                    </div>
                    <div className="flex space-x-2">
                        <Select
                            value={reportType}
                            onValueChange={setReportType}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="summary">Summary Report</SelectItem>
                                <SelectItem value="patient">Patient Report</SelectItem>
                                <SelectItem value="appointment">Appointment Report</SelectItem>
                                <SelectItem value="financial">Financial Report</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleDownloadReport}>
                            {/* Download icon placeholder */}
                            Download Report
                        </Button>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                                    <p className="text-3xl font-bold">{stats.users.patients}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                    {/* User icon placeholder */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Doctors</p>
                                    <p className="text-3xl font-bold">{stats.users.doctors}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3 text-green-600">
                                    {/* Doctor icon placeholder */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">New Users This Month</p>
                                    <p className="text-3xl font-bold">{stats.users.new_this_month}</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                    {/* UserPlus icon placeholder */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Appointments This Month</p>
                                    <p className="text-3xl font-bold">{stats.appointments.this_month}</p>
                                </div>
                                <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                                    {/* FileText icon placeholder */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-8 grid w-full grid-cols-3">
                        <TabsTrigger value="appointment">Appointment Trends</TabsTrigger>
                        <TabsTrigger value="patient">Patient Growth</TabsTrigger>
                        <TabsTrigger value="type">Appointment Types</TabsTrigger>
                    </TabsList>

                    <TabsContent value="appointment">
                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Appointment Trends</CardTitle>
                                <CardDescription>
                                    Appointments by status over the last 6 months
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={charts.appointmentTrends}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="pending"
                                                stroke="#facc15"
                                                activeDot={{ r: 8 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="completed"
                                                stroke="#10b981"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="cancelled"
                                                stroke="#ef4444"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="patient">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Growth</CardTitle>
                                <CardDescription>
                                    New patient registrations over the last 6 months
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={charts.patientGrowth}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="new_patients"
                                                fill="#8884d8"
                                                name="New Patients"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="type">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appointment Types</CardTitle>
                                <CardDescription>
                                    Distribution of appointment categories
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={charts.appointmentTypes}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {charts.appointmentTypes.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
