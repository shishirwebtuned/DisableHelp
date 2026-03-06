'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, Plus, Trash2 } from 'lucide-react';

interface ProfessionalDetailsProps {
    onSave: (data: ProfessionalDetailsData, navigate?: boolean) => void;
    currentView?: string;
    initialData?: ProfessionalDetailsData;
}

export interface ProfessionalDetailsData {
    experience: {
        years: string;
        totalHours: string;
        specializations: string;
    };
    workHistory: Array<{
        id: number;
        organisation: string;
        jobTitle: string;
        startDate: string;
        endDate?: string;
        currentlyWorkingHere: boolean;
    }>;
    education: Array<{
        id: number;
        institution: string;
        course: string;
        startDate: string;
        endDate?: string;
        currentlyStudyingHere: boolean;
    }>;
    ndisWorkerScreening: {
        screening_number: string;
        expiry_date: string;
        legal_first_name: string;
        legal_last_name: string;
        date_of_birth: string;
    };
    wwcc: {
        wwccNumber: string;
        expiryDate: string;
    };
    additionalTraining: {
        cpr: { expiryDate: string; };
        firstAid: { expiryDate: string; };
        driverLicense: { expiryDate: string; };
    };
}

export default function ProfessionalDetails({ onSave, currentView = 'experience', initialData }: ProfessionalDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);

    // Use a ref to track if we've already initialized from initialData
    const isInitialized = useRef(false);

    const [experience, setExperience] = useState({
        years: '',
        totalHours: '',
        specializations: ''
    });
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

    const [workHistory, setWorkHistory] = useState<ProfessionalDetailsData['workHistory']>([]);
    const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
    const [currentWork, setCurrentWork] = useState({ jobTitle: '', organisation: '', startDate: '', endDate: '', currentlyWorkingHere: false });

    const [education, setEducation] = useState<ProfessionalDetailsData['education']>([]);
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [currentEducation, setCurrentEducation] = useState({ course: '', institution: '', startDate: '', endDate: '', currentlyStudyingHere: false });

    // Compliance
    const [ndisWorkerScreening, setNdisWorkerScreening] = useState({
        screening_number: '',
        expiry_date: '',
        legal_first_name: '',
        legal_last_name: '',
        date_of_birth: ''
    });

    const [wwcc, setWwcc] = useState({
        wwccNumber: '',
        expiryDate: ''
    });

    const [additionalTraining, setAdditionalTraining] = useState({
        cpr: { expiryDate: '' },
        firstAid: { expiryDate: '' },
        driverLicense: { expiryDate: '' }
    });


    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    useEffect(() => {
        if (initialData) {
            setExperience(prev => JSON.stringify(initialData.experience) === JSON.stringify(prev) ? prev : initialData.experience || prev);
            setWorkHistory(prev => JSON.stringify(initialData.workHistory) === JSON.stringify(prev) ? prev : initialData.workHistory || prev);
            setEducation(prev => JSON.stringify(initialData.education) === JSON.stringify(prev) ? prev : initialData.education || prev);
            setNdisWorkerScreening(prev => JSON.stringify(initialData.ndisWorkerScreening) === JSON.stringify(prev) ? prev : initialData.ndisWorkerScreening || prev);
            setWwcc(prev => JSON.stringify(initialData.wwcc) === JSON.stringify(prev) ? prev : initialData.wwcc || prev);
            setAdditionalTraining(prev => JSON.stringify(initialData.additionalTraining) === JSON.stringify(prev) ? prev : initialData.additionalTraining || prev);

            isInitialized.current = true;
        }
    }, [initialData]);

    const currentData = useMemo(() => ({
        experience,
        workHistory,
        education,
        ndisWorkerScreening,
        wwcc,
        additionalTraining
    }), [experience, workHistory, education, ndisWorkerScreening, wwcc, additionalTraining]);

    useEffect(() => {
        // Sync data to parent only if we have initialData and it's different
        if (initialData && isInitialized.current) {
            const initialStr = JSON.stringify(initialData);
            const currentStr = JSON.stringify(currentData);
            if (currentStr !== initialStr) {
                const timeoutId = setTimeout(() => {
                    onSave(currentData, false);
                }, 0);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [currentData, initialData, onSave]);

    const handleSave = useCallback(() => {
        onSave(currentData, true);
    }, [currentData, onSave]);

    const handleAddWork = () => {
        if (currentWork.jobTitle && currentWork.organisation) {
            setWorkHistory([...workHistory, { ...currentWork, id: Date.now() }]);
            setCurrentWork({ jobTitle: '', organisation: '', startDate: '', endDate: '', currentlyWorkingHere: false });
            setIsWorkModalOpen(false);
        }
    };

    const handleDeleteWork = (id: number) => {
        setWorkHistory(workHistory.filter(w => w.id !== id));
    };

    const handleAddEducation = () => {
        if (currentEducation.course && currentEducation.institution) {
            setEducation([...education, { ...currentEducation, id: Date.now() }]);
            setCurrentEducation({ course: '', institution: '', startDate: '', endDate: '', currentlyStudyingHere: false });
            setIsEducationModalOpen(false);
        }
    };

    const handleDeleteEducation = (id: number) => {
        setEducation(education.filter(e => e.id !== id));
    };

    const renderExperience = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Experience Summary</h2>
                    <p className="text-muted-foreground">Your overall experience</p>
                </div>
                <Button onClick={() => setIsExperienceModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Edit Experience
                </Button>
            </div>
            <Card className=' border-none p-0  '>
                <CardContent className="pt-6 p-0 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border border-border rounded-lg bg-card">
                            <p className="text-sm text-muted-foreground mb-1">Years of Experience</p>
                            <p className="text-2xl font-bold text-foreground">{experience.years} years</p>
                        </div>
                        <div className="p-4 border border-border rounded-lg bg-card">
                            <p className="text-sm text-muted-foreground mb-1">Specializations</p>
                            <p className="text-sm font-medium text-foreground">{experience.specializations}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave}>Save and Continue</Button>
            </div>
        </div>
    );

    const renderWorkHistory = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Work History</h2>
                    <p className="text-muted-foreground">Add your previous work experience</p>
                </div>
                <Button onClick={() => setIsWorkModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Work History
                </Button>
            </div>
            <Card className=' border-none p-0'>
                <CardContent className="pt-6 p-0 space-y-4">
                    {workHistory.map((work) => (
                        <div key={work.id} className="border-l-2 border-blue-500 pl-4 relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute -right-2 top-0"
                                onClick={() => handleDeleteWork(work.id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            <h4 className="font-semibold">{work.jobTitle}</h4>
                            <p className="text-sm text-muted-foreground">{work.organisation}</p>
                            <p className="text-xs text-muted-foreground mb-2">
                                {work.startDate} - {work.currentlyWorkingHere ? 'Present' : work.endDate}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave}>Save and Continue</Button>
            </div>
        </div>
    );

    const renderEducation = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Education & Training</h2>
                    <p className="text-muted-foreground">Add your qualifications</p>
                </div>
                <Button onClick={() => setIsEducationModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                </Button>
            </div>
            <Card className=' p-0 border-none'>
                <CardContent className="pt-6 p-0 space-y-4">
                    {education.map((edu) => (
                        <div key={edu.id} className="border-l-2 border-blue-600 pl-4 relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute -right-2 top-0"
                                onClick={() => handleDeleteEducation(edu.id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            <h4 className="font-semibold">{edu.course}</h4>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            <p className="text-xs text-muted-foreground">
                                {edu.startDate} - {edu.currentlyStudyingHere ? 'Present' : edu.endDate}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave}>Save and Continue</Button>
            </div>
        </div>
    );

    const renderCredentials = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Compliance & Screening</h2>
                <p className="text-muted-foreground">NDIS Check, WWCC and other certifications</p>
            </div>

            <Card className=' p-0 border-none space-y-6'>
                <CardContent className="pt-6 p-0 space-y-6">
                    {/* NDIS Worker Screening */}
                    <div className="space-y-4 border border-border p-4 rounded-lg bg-card">
                        <h3 className="font-semibold text-lg text-foreground">NDIS Worker Screening</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-foreground/80">Screening Number</Label>
                                <Input value={ndisWorkerScreening.screening_number} onChange={(e) => setNdisWorkerScreening({ ...ndisWorkerScreening, screening_number: e.target.value })} className="bg-background border-border" />
                            </div>
                            <div>
                                <Label>Expiry Date</Label>
                                <div className="mt-1">
                                    <DatePicker date={ndisWorkerScreening.expiry_date ? new Date(ndisWorkerScreening.expiry_date) : undefined} setDate={(date) => setNdisWorkerScreening({ ...ndisWorkerScreening, expiry_date: date ? format(date, 'yyyy-MM-dd') : '' })} />
                                </div>
                            </div>
                            <div>
                                <Label>Legal First Name</Label>
                                <Input value={ndisWorkerScreening.legal_first_name} onChange={(e) => setNdisWorkerScreening({ ...ndisWorkerScreening, legal_first_name: e.target.value })} />
                            </div>
                            <div>
                                <Label>Date of Birth</Label>
                                <div className="mt-1">
                                    <DatePicker date={ndisWorkerScreening.date_of_birth ? new Date(ndisWorkerScreening.date_of_birth) : undefined} setDate={(date) => setNdisWorkerScreening({ ...ndisWorkerScreening, date_of_birth: date ? format(date, 'yyyy-MM-dd') : '' })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* WWCC */}
                    <div className="space-y-4 border border-border p-4 rounded-lg bg-card">
                        <h3 className="font-semibold text-lg text-foreground">Working with Children Check</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>WWCC Number</Label>
                                <Input value={wwcc.wwccNumber} onChange={(e) => setWwcc({ ...wwcc, wwccNumber: e.target.value })} />
                            </div>
                            <div>
                                <Label>Expiry Date</Label>
                                <div className="mt-1">
                                    <DatePicker date={wwcc.expiryDate ? new Date(wwcc.expiryDate) : undefined} setDate={(date) => setWwcc({ ...wwcc, expiryDate: date ? format(date, 'yyyy-MM-dd') : '' })} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Training */}
                    <div className="space-y-4 border border-border p-4 rounded-lg bg-card">
                        <h3 className="font-semibold text-lg text-foreground">Certifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>CPR Expiry</Label>
                                <div className="mt-1">
                                    <DatePicker date={additionalTraining.cpr.expiryDate ? new Date(additionalTraining.cpr.expiryDate) : undefined} setDate={(date) => setAdditionalTraining({ ...additionalTraining, cpr: { ...additionalTraining.cpr, expiryDate: date ? format(date, 'yyyy-MM-dd') : '' } })} />
                                </div>
                            </div>
                            <div>
                                <Label>First Aid Expiry</Label>
                                <div className="mt-1">
                                    <DatePicker date={additionalTraining.firstAid.expiryDate ? new Date(additionalTraining.firstAid.expiryDate) : undefined} setDate={(date) => setAdditionalTraining({ ...additionalTraining, firstAid: { ...additionalTraining.firstAid, expiryDate: date ? format(date, 'yyyy-MM-dd') : '' } })} />
                                </div>
                            </div>
                            <div>
                                <Label>Driver License Expiry</Label>
                                <div className="mt-1">
                                    <DatePicker date={additionalTraining.driverLicense.expiryDate ? new Date(additionalTraining.driverLicense.expiryDate) : undefined} setDate={(date) => setAdditionalTraining({ ...additionalTraining, driverLicense: { ...additionalTraining.driverLicense, expiryDate: date ? format(date, 'yyyy-MM-dd') : '' } })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave}>Save and Continue</Button>
            </div>
        </div>
    );

    return (
        <>
            {currentSection === 'experience' && renderExperience()}
            {currentSection === 'work-history' && renderWorkHistory()}
            {currentSection === 'education-training' && renderEducation()}
            {currentSection === 'credentials' && renderCredentials()}

            {/* Modals */}
            <Dialog open={isExperienceModalOpen} onOpenChange={setIsExperienceModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Experience</DialogTitle>
                        <DialogDescription>Update your professional experience details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Years of Experience</Label>
                            <Input
                                type="number"
                                value={experience.years}
                                onChange={(e) => setExperience({ ...experience, years: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Specializations</Label>
                            <Textarea
                                value={experience.specializations}
                                onChange={(e) => setExperience({ ...experience, specializations: e.target.value })}
                                className="mt-2"
                                placeholder="e.g., Personal Care, Community Support, Transport"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExperienceModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => { setIsExperienceModalOpen(false); handleSave(); }}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isWorkModalOpen} onOpenChange={setIsWorkModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Work History</DialogTitle>
                        <DialogDescription>Add your previous work experience</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Job Title</Label>
                            <Input
                                value={currentWork.jobTitle}
                                onChange={(e) => setCurrentWork({ ...currentWork, jobTitle: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Organisation</Label>
                            <Input
                                value={currentWork.organisation}
                                onChange={(e) => setCurrentWork({ ...currentWork, organisation: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <div className="mt-2">
                                    <DatePicker date={currentWork.startDate ? new Date(currentWork.startDate) : undefined} setDate={(date) => setCurrentWork({ ...currentWork, startDate: date ? format(date, 'yyyy-MM-dd') : '' })} />
                                </div>
                            </div>
                            {!currentWork.currentlyWorkingHere && (
                                <div>
                                    <Label>End Date</Label>
                                    <div className="mt-2">
                                        <DatePicker date={currentWork.endDate ? new Date(currentWork.endDate) : undefined} setDate={(date) => setCurrentWork({ ...currentWork, endDate: date ? format(date, 'yyyy-MM-dd') : '' })} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                id="currentlyWorking"
                                checked={currentWork.currentlyWorkingHere}
                                onChange={(e) => setCurrentWork({ ...currentWork, currentlyWorkingHere: e.target.checked })}
                                className="rounded border-border text-blue-600 focus:ring-blue-500 bg-background accent-blue-600"
                            />
                            <Label htmlFor="currentlyWorking">Currently working here</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWorkModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddWork}>Add Work History</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEducationModalOpen} onOpenChange={setIsEducationModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Education & Training</DialogTitle>
                        <DialogDescription>Add your qualifications</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Course Name</Label>
                            <Input
                                value={currentEducation.course}
                                onChange={(e) => setCurrentEducation({ ...currentEducation, course: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Institution</Label>
                            <Input
                                value={currentEducation.institution}
                                onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <div className="mt-2">
                                    <DatePicker date={currentEducation.startDate ? new Date(currentEducation.startDate) : undefined} setDate={(date) => setCurrentEducation({ ...currentEducation, startDate: date ? format(date, 'yyyy-MM-dd') : '' })} />
                                </div>
                            </div>
                            {!currentEducation.currentlyStudyingHere && (
                                <div>
                                    <Label>End Date</Label>
                                    <div className="mt-2">
                                        <DatePicker date={currentEducation.endDate ? new Date(currentEducation.endDate) : undefined} setDate={(date) => setCurrentEducation({ ...currentEducation, endDate: date ? format(date, 'yyyy-MM-dd') : '' })} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                            <input
                                type="checkbox"
                                id="currentlyStudying"
                                checked={currentEducation.currentlyStudyingHere}
                                onChange={(e) => setCurrentEducation({ ...currentEducation, currentlyStudyingHere: e.target.checked })}
                                className="rounded border-border text-blue-600 focus:ring-blue-500 bg-background accent-blue-600"
                            />
                            <Label htmlFor="currentlyStudying">Currently studying here</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEducationModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddEducation}>Add Education</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
