'use client';

import { useState, useEffect } from 'react';
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
    onSave: (data: ProfessionalDetailsData) => void;
    currentView?: string;
}

export interface ProfessionalDetailsData {
    experience: {
        years: string;
        totalHours: string;
        specializations: string;
    };
    workHistory: Array<{
        id: number;
        position: string;
        org: string;
        duration: string;
        desc: string;
    }>;
    education: Array<{
        id: number;
        title: string;
        institution: string;
        year: string;
    }>;
    credentials: Array<{
        id: number;
        name: string;
        number: string;
        expiry: string;
    }>;
}

export default function ProfessionalDetails({ onSave, currentView = 'experience' }: ProfessionalDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);
    const [experience, setExperience] = useState({
        years: '8',
        totalHours: '5200',
        specializations: 'Personal Care, Community Support, Transport'
    });
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);

    const [workHistory, setWorkHistory] = useState([
        { id: 1, position: 'Support Worker', org: 'Independent Contractor', duration: '2018 - Present', desc: 'Providing personalized support services to NDIS participants' },
        { id: 2, position: 'Care Assistant', org: 'Care Connect NSW', duration: '2016 - 2018', desc: 'Assisted elderly and disabled clients with daily living activities' }
    ]);
    const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
    const [currentWork, setCurrentWork] = useState({ position: '', org: '', duration: '', desc: '' });

    const [education, setEducation] = useState([
        { id: 1, title: 'Certificate IV in Disability', institution: 'TAFE NSW', year: '2018' },
        { id: 2, title: 'Certificate III in Individual Support', institution: 'TAFE NSW', year: '2016' }
    ]);
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [currentEducation, setCurrentEducation] = useState({ title: '', institution: '', year: '' });

    const [credentials, setCredentials] = useState([
        { id: 1, name: 'NDIS Worker Screening', number: 'NSW12345', expiry: '2027-06-15' },
        { id: 2, name: 'Working with Children Check', number: 'WWC12345', expiry: '2029-03-20' },
        { id: 3, name: 'First Aid Certificate', number: 'FA12345', expiry: '2027-01-10' }
    ]);
    const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
    const [currentCredential, setCurrentCredential] = useState({ name: '', number: '', expiry: '' });

    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    useEffect(() => {
        const data = { experience, workHistory, education, credentials };
        console.log('ProfessionalDetails Data:', data);
    }, [experience, workHistory, education, credentials]);

    const handleSave = () => {
        const data = { experience, workHistory, education, credentials };
        console.log('Saving Professional Details:', data);
        onSave(data);
    };

    const handleAddWork = () => {
        if (currentWork.position && currentWork.org) {
            setWorkHistory([...workHistory, { ...currentWork, id: Date.now() }]);
            setCurrentWork({ position: '', org: '', duration: '', desc: '' });
            setIsWorkModalOpen(false);
        }
    };

    const handleDeleteWork = (id: number) => {
        setWorkHistory(workHistory.filter(w => w.id !== id));
    };

    const handleAddEducation = () => {
        if (currentEducation.title && currentEducation.institution) {
            setEducation([...education, { ...currentEducation, id: Date.now() }]);
            setCurrentEducation({ title: '', institution: '', year: '' });
            setIsEducationModalOpen(false);
        }
    };

    const handleDeleteEducation = (id: number) => {
        setEducation(education.filter(e => e.id !== id));
    };

    const handleAddCredential = () => {
        if (currentCredential.name && currentCredential.number) {
            setCredentials([...credentials, { ...currentCredential, id: Date.now() }]);
            setCurrentCredential({ name: '', number: '', expiry: '' });
            setIsCredentialModalOpen(false);
        }
    };

    const handleDeleteCredential = (id: number) => {
        setCredentials(credentials.filter(c => c.id !== id));
    };

    const renderExperience = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Experience</h2>
                    <p className="text-muted-foreground">Your professional experience details</p>
                </div>
                <Button onClick={() => setIsExperienceModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Edit Experience
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Years of Experience</p>
                            <p className="text-2xl font-bold">{experience.years} years</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Total Hours Worked</p>
                            <p className="text-2xl font-bold">{experience.totalHours}+</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Specializations</p>
                            <p className="text-sm font-medium">{experience.specializations}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
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
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {workHistory.map((work) => (
                        <div key={work.id} className="border-l-2 border-purple-600 pl-4 relative">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="absolute -right-2 top-0"
                                onClick={() => handleDeleteWork(work.id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                            <h4 className="font-semibold">{work.position}</h4>
                            <p className="text-sm text-muted-foreground">{work.org}</p>
                            <p className="text-xs text-muted-foreground mb-2">{work.duration}</p>
                            <p className="text-sm">{work.desc}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
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
            <Card>
                <CardContent className="pt-6 space-y-4">
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
                            <h4 className="font-semibold">{edu.title}</h4>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            <p className="text-xs text-muted-foreground">{edu.year}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderCredentials = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Credentials & Certifications</h2>
                    <p className="text-muted-foreground">Add your credentials and certifications</p>
                </div>
                <Button onClick={() => setIsCredentialModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credential
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-3">
                    {credentials.map((cred) => (
                        <div key={cred.id} className="flex items-start gap-3 p-4 border rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium">{cred.name}</p>
                                <p className="text-sm text-muted-foreground">No. {cred.number}</p>
                                <p className="text-xs text-muted-foreground">Valid until {new Date(cred.expiry).toLocaleDateString()}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteCredential(cred.id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
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
                                onChange={(e) => setExperience({...experience, years: e.target.value})}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Total Hours Worked</Label>
                            <Input
                                type="number"
                                value={experience.totalHours}
                                onChange={(e) => setExperience({...experience, totalHours: e.target.value})}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Specializations</Label>
                            <Textarea
                                value={experience.specializations}
                                onChange={(e) => setExperience({...experience, specializations: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., Personal Care, Community Support, Transport"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExperienceModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsExperienceModalOpen(false)}>Save Changes</Button>
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
                            <Label>Position/Job Title</Label>
                            <Input
                                value={currentWork.position}
                                onChange={(e) => setCurrentWork({...currentWork, position: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., Support Worker"
                            />
                        </div>
                        <div>
                            <Label>Organization</Label>
                            <Input
                                value={currentWork.org}
                                onChange={(e) => setCurrentWork({...currentWork, org: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., Care Connect NSW"
                            />
                        </div>
                        <div>
                            <Label>Duration</Label>
                            <Input
                                value={currentWork.duration}
                                onChange={(e) => setCurrentWork({...currentWork, duration: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., 2018 - Present"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={currentWork.desc}
                                onChange={(e) => setCurrentWork({...currentWork, desc: e.target.value})}
                                className="mt-2"
                                placeholder="Describe your role and responsibilities..."
                            />
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
                        <DialogDescription>Add your qualifications and certifications</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Qualification Title</Label>
                            <Input
                                value={currentEducation.title}
                                onChange={(e) => setCurrentEducation({...currentEducation, title: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., Certificate IV in Disability"
                            />
                        </div>
                        <div>
                            <Label>Institution</Label>
                            <Input
                                value={currentEducation.institution}
                                onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., TAFE NSW"
                            />
                        </div>
                        <div>
                            <Label>Year Completed</Label>
                            <Input
                                value={currentEducation.year}
                                onChange={(e) => setCurrentEducation({...currentEducation, year: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., 2018"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEducationModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddEducation}>Add Education</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCredentialModalOpen} onOpenChange={setIsCredentialModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Credential</DialogTitle>
                        <DialogDescription>Add a new credential or certification</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Credential Name</Label>
                            <Input
                                value={currentCredential.name}
                                onChange={(e) => setCurrentCredential({...currentCredential, name: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., NDIS Worker Screening"
                            />
                        </div>
                        <div>
                            <Label>Credential Number</Label>
                            <Input
                                value={currentCredential.number}
                                onChange={(e) => setCurrentCredential({...currentCredential, number: e.target.value})}
                                className="mt-2"
                                placeholder="e.g., NSW12345"
                            />
                        </div>
                        <div>
                            <Label>Expiry Date</Label>
                            <div className="mt-2">
                                <DatePicker
                                    date={currentCredential.expiry ? new Date(currentCredential.expiry) : undefined}
                                    setDate={(date) => setCurrentCredential({...currentCredential, expiry: date ? format(date, 'yyyy-MM-dd') : ''})}
                                    placeholder="Select expiry date"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCredentialModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCredential}>Add Credential</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
